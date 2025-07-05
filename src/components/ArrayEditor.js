import React from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import FieldInput from './FieldInput';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';

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
				<Label className="text-sm font-medium">
					{field.title}
					{field.mandatory && <span className="text-destructive ml-1">*</span>}
				</Label>
				<Button
					variant="outline"
					size="sm"
					onClick={addItem}
					className="flex items-center"
				>
					<Plus className="w-4 h-4 mr-1" />
					Add
				</Button>
			</div>

			{field.description && (
				<p className="text-xs text-muted-foreground">{field.description}</p>
			)}

			<div className="space-y-2">
				{value.map((item, index) => (
					<Card key={index} className="border-muted">
						<CardContent className="flex items-start space-x-2 p-3">
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
							<Button
								variant="destructive"
								size="sm"
								onClick={() => removeItem(index)}
								className="flex items-center"
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

			{errors.map((error, idx) => (
				<Alert key={idx} variant="destructive" className="py-2">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription className="text-xs">
						{error}
					</AlertDescription>
				</Alert>
			))}
		</div>
	);
};

export default ArrayEditor; 