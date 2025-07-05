import React from 'react';
import { HelpCircle, AlertCircle } from 'lucide-react';

const FieldInput = ({ field, value, onChange, errors = [] }) => {
	const hasError = errors.length > 0;

	const renderField = () => {
		switch (field.type) {
			case 'string':
			case 'text':
				return (
					<input
						type="text"
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						className={`w-full px-3 py-2 border rounded-md ${hasError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
						placeholder={field.description}
					/>
				);

			case 'integer':
			case 'number':
				return (
					<input
						type="number"
						value={value || ''}
						onChange={(e) => onChange(field.type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value))}
						className={`w-full px-3 py-2 border rounded-md ${hasError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
						placeholder={field.description}
					/>
				);

			case 'boolean':
			case 'checkbox':
				return (
					<div className="flex items-center">
						<input
							type="checkbox"
							checked={value || false}
							onChange={(e) => onChange(e.target.checked)}
							className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
						/>
						<label className="ml-2 text-sm text-gray-700">{field.title}</label>
					</div>
				);

			case 'enum':
			case 'select':
				return (
					<select
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						className={`w-full px-3 py-2 border rounded-md ${hasError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
					>
						<option value="">Select an option</option>
						{(field.enum || field.options || []).map((option, idx) => (
							<option key={idx} value={option}>{option}</option>
						))}
					</select>
				);

			default:
				return (
					<input
						type="text"
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						className={`w-full px-3 py-2 border rounded-md ${hasError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
						placeholder={field.description}
					/>
				);
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center space-x-2">
				<label className="block text-sm font-medium text-gray-700">
					{field.title}
					{field.mandatory && <span className="text-red-500 ml-1">*</span>}
				</label>
				{field.docRef && (
					<HelpCircle
						className="w-4 h-4 text-gray-400 cursor-help"
						title="Click for help documentation"
					/>
				)}
			</div>

			{renderField()}

			{field.description && (
				<p className="text-xs text-gray-500">{field.description}</p>
			)}

			{errors.map((error, idx) => (
				<p key={idx} className="text-xs text-red-500 flex items-center">
					<AlertCircle className="w-3 h-3 mr-1" />
					{error}
				</p>
			))}
		</div>
	);
};

export default FieldInput; 