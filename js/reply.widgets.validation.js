// Validation v5.0
var Validation = { version: '5.0' };

Validation.observe = function() {
  var fields = $('[data-validate]');
  fields.each(function(_,field) {
    field = $(field);
    var input = field.is('input') ? field : field.find('input');
    // console.log('observing ' + input.attr('id'));
    input.bind('keyup focusout click', function() { Validation.validate(field); });
    if ((input.is(':text') && input.val()) || input.is(':checked, :selected')) input.trigger('focusout');
  });
};

Validation.formats = {
  zip:    { format:'^\\d{5}$', message:'need a 5 digit zip' },
  phone:  { format:'^\\s*\\(?\\s*\\d{3}\\s*[).-]?\\s*\\d{3}\\s*[.-]?\\s*\\d{4}\\s*$', message:'need a 10 digit number' },
  phone_area:  { format:'^\\s*\\(?\\s*\\d{3}\\s*[).-]?\\s*$', message:'need a US phone number' },
  phone_prefix:  { format:'^\\s*\\d{3}\\s*$', message:'need a US phone number' },
  phone_suffix:  { format:'^\\s*\\d{4}\\s*$', message:'need a US phone number' },
  email:  { format:'^([a-zA-Z0-9_\\-\\.+]+)@((\\[ [0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)|(([a-zA-Z0-9\\-]+\\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\\]?)$', message:'need a valid email' }
};

// mainly just sets up variables and passes along to the right validator
Validation.validate = function(element, fireEvent) {
  // console.log('validate()');
  var field, format, message, result, validation, validator;
  field       = $(element);
  Validation.clearError(field);
  format      = field.attr('data-format');
  message     = field.attr('data-error-message');
  validation  = field.attr('data-validate');
  validator   = Validation.validators[validation];
  result      = validator ? validator({ field:field, format:format, message:message }) :
                Validation.validators.unknown(validation);
  field.data('valid', result);
  if (fireEvent !== false) field.trigger('validation:' + (result ? 'success' : 'failure'));
  return result;
};

Validation.validators = {};

// validate the presence of the specified element, displaying an error message if it is invalid
Validation.validators.presence = function(params) {
  // console.log('validators.presence()');
  field   = $(params.field);
  message = params.message || 'required';

  if (field.is('input')) {
    if (!field.val()) return Validation.addError(field, message);
  } else if (!field.find(':checked, :selected').length) {
    return Validation.addError(field.find('input').last(), message);
  } else if (field.is('select')) {
    Validation.clearError(field);
    if (!field.val()) return Validation.addError(field, message);
  }
  return true;
};

// validate the given format of the specified element, displayin an error message if it is invalid
Validation.validators.format = function(params) {
  // console.log('validators.format()');
  field   = $(params.field);
  format  = new RegExp(params.format);
  message = params.message || 'invalid format';

  if (field.is(':text') && !format.test(field.val())) {
    return Validation.addError(field, message);
  }
  return true;
};

// shortcut to validate a zip-code format
Validation.validators.zip = function(params) {
  // console.log('validators.zip()');
  var zip = Validation.formats.zip;
  params.format   = zip.format;
  params.message  = params.message || zip.message;
  return Validation.validators.format(params);
};

// shortcut to validate a phone number format
Validation.validators.phone = function(params) {
  // console.log('validators.phone()');
  var phone = Validation.formats.phone;
  params.format   = phone.format;
  params.message  = params.message || phone.message;
  return Validation.validators.format(params);
};

// shortcut to validate a phone number format (area code)
Validation.validators.phone_area = function(params) {
  // console.log('validators.phone_area()');
  var phone_area = Validation.formats.phone_area;
  params.format   = phone_area.format;
  params.message  = params.message || phone_area.message;
  return Validation.validators.format(params);
};

// shortcut to validate a phone number format (prefix)
Validation.validators.phone_prefix = function(params) {
  // console.log('validators.phone_prefix()');
  var phone_prefix = Validation.formats.phone_prefix;
  params.format   = phone_prefix.format;
  params.message  = params.message || phone_prefix.message;
  return Validation.validators.format(params);
};

// shortcut to validate a phone number format (suffix)
Validation.validators.phone_suffix = function(params) {
  // console.log('validators.phone_suffix()');
  var phone_suffix = Validation.formats.phone_suffix;
  params.format   = phone_suffix.format;
  params.message  = params.message || phone_suffix.message;
  return Validation.validators.format(params);
};

// shortcut to validate an email format
Validation.validators.email = function(params) {
  // console.log('validators.email()');
  var email = Validation.formats.email;
  params.format   = email.format;
  params.message  = params.message || email.message;
  return Validation.validators.format(params);
};

// if possible, log an unknown validation request
Validation.validators.unknown = function(validator) {
  // console.log('validators.unknown()');
  // if (window.console && window.console.log) window.console.log('unknown validator: ' + validator);
  return true;
};

// add an error message to the specified element
Validation.addError = function(field, message) {
  // console.log('addError()');
  $(field).addClass('error').after($('<span class="error_message" />').html(message || 'invalid'));
  return false;
};

Validation.clearError = function(field) {
  field = $(field);
  if (field.is('input')) field.removeClass('error').next('.error_message').remove();
  else if (field.is('select')) field.nextAll('.error_message').remove();
  else field.find('input').removeClass('error').nextAll('.error_message').remove();
};

// check that all fields within a given container which require validation are in fact valid
Validation.allValid = function(container) {
  // console.log('allValid()');
  var haveError = false;
  $(container).find('[data-validate]').each(function() {
    if ($(this).data('valid') !== true) {
      haveError = true;
    }
  });
  return !haveError;
};

// run all validations within a given container, but don't trigger the validation event
Validation.validateAll = function(container) {
  // console.log('validateAll()');
  $(container).find('[data-validate]').each(function() { Validation.validate(this, false); });
  return Validation.allValid(container);
};

Validation.validateAllWithValue = function(container) {
  //console.log('validateAllWithValue()');
  $(container).find('[data-validate]').each(function() {
    if (($(this).is(':text') && $(this).val()) || $(this).find(':checked, :selected').length) {
      Validation.validate(this, false);
    }
  });
  return Validation.allValid(container);
};
