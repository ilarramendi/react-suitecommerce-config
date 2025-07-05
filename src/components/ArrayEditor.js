import React from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import FieldInput from './FieldInput';

const ArrayEditor = ({ field, value = [], onChange, errors = [] }) => {
	const addItem = () => {
		const newItem = field.items.type === 'object'
			? Object.keys(field.items.properties || {}).reduce((acc, key) => {
				acc[key] = field.items.properties[key].default || '';
				return acc;
			}, {})
			: '';

		onChange([...value, newItem]);
	};

	const removeItem = (index) => {
		const newValue = value.filter((_, i) => i !== index);
		onChange(newValue);
	};

	const updateItem = (index, itemValue) => {
		const newValue = [...value];
		newValue[index] = itemValue;
		onChange(newValue);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<label className="block text-sm font-medium text-gray-700">
					{field.title}
					{field.mandatory && <span className="text-red-500 ml-1">*</span>}
				</label>
				<button
					onClick={addItem}
					className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
				>
					<Plus className="w-4 h-4 mr-1" />
					Add
				</button>
			</div>

			{field.description && (
				<p className="text-xs text-gray-500">{field.description}</p>
			)}

			<div className="space-y-2">
				{value.map((item, index) => (
					<div key={index} className="flex items-start space-x-2 p-3 border rounded-md bg-gray-50">
						<div className="flex-1">
							{field.items.type === 'object' ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{Object.keys(field.items.properties || {}).map(propKey => {
										const propField = field.items.properties[propKey];
										return (
											<FieldInput
												key={propKey}
												field={{ ...propField, title: propField.title || propKey }}
												value={item[propKey]}
												onChange={(val) => updateItem(index, { ...item, [propKey]: val })}
											/>
										);
									})}
								</div>
							) : (
								<FieldInput
									field={field.items}
									value={item}
									onChange={(val) => updateItem(index, val)}
								/>
							)}
						</div>
						<button
							onClick={() => removeItem(index)}
							className="flex items-center px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
						>
							<Trash2 className="w-4 h-4" />
						</button>
					</div>
				))}
			</div>

			{errors.map((error, idx) => (
				<p key={idx} className="text-xs text-red-500 flex items-center">
					<AlertCircle className="w-3 h-3 mr-1" />
					{error}
				</p>
			))}
		</div>
	);
};

export default ArrayEditor; 