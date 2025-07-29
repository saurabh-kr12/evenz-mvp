import { useState } from 'react';

const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({}); // renamed state variable

  const validate = (fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    for (let rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return '';
  };

  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touchedFields[name]) {
      const error = validate(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const markTouched = (name) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    const error = validate(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(field => {
      const error = validate(field, values[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    values,
    errors,
    touched: touchedFields,
    setValue,
    markTouched,     // renamed to avoid conflict
    validateAll
  };
};

export default useFormValidation;
