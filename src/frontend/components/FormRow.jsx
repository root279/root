import React from 'react';

const FormRow = ({
  text,
  type,
  handleChange,
  value,
  placeholder,
  name,
  disabled = false,
}) => {
  // Función para mostrar sugerencias de email según el input
  const getEmailSuggestion = (inputValue) => {
    if (type === 'email' && inputValue && !inputValue.includes('@')) {
      return `${inputValue}@gmail.com`;
    }
    return '';
  };

  const emailSuggestion = type === 'email' ? getEmailSuggestion(value) : '';

  return (
    <div className='form-row'>
      <label className='form-label' htmlFor={name}>
        {text}
        {type === 'email' && (
          <small style={{ 
            display: 'block', 
            color: 'var(--grey-500)', 
            fontWeight: 'normal',
            marginTop: '0.25rem',
            fontSize: '0.8rem'
          }}>
            📧 Acepta Gmail, Yahoo, Hotmail, Outlook y cualquier otro proveedor
          </small>
        )}
      </label>
      <input
        className='form-input'
        type={type}
        name={name}
        id={name}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        required={true}
        disabled={disabled}
        {...(type === 'email' && {
          autoComplete: 'email',
          spellCheck: false
        })}
      />
      {emailSuggestion && value && !value.includes('@') && (
        <small style={{ 
          color: 'var(--primary-600)', 
          fontSize: '0.8rem',
          marginTop: '0.25rem',
          display: 'block'
        }}>
          💡 Sugerencia: {emailSuggestion}
        </small>
      )}
    </div>
  );
};

export default FormRow;
