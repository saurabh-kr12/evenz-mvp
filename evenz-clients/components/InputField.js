import React, { useState } from 'react';
import { Eye, EyeOff, XCircle } from 'lucide-react';

const InputField = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  onBlur = () => {}, 
  error, 
  placeholder,
  icon: Icon,
  disabled = false,
  maxLength
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full px-4 py-3 ${Icon ? 'pl-12' : ''} ${type === 'password' ? 'pr-12' : ''} 
            border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200 ${error ? 'border-red-500' : ''} ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
            text-base`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <XCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;