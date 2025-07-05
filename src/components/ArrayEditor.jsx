import { Plus, Trash2, AlertCircle, HelpCircle, X } from 'lucide-react';
import React, { useState } from 'react';

import FieldInput from './FieldInput';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const ArrayEditor = ({ field, value = [], onChange, errors = [] }) => {
	const [editingIndex, setEditingIndex] = useState(null);
	const [editingValue, setEditingValue] = useState('');

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

	const updateItemProperty = (index, propKey, propValue) => {
		const newValue = [...value];
		newValue[index] = { ...newValue[index], [propKey]: propValue };
		onChange(newValue);
	};

	const startEditing = (index) => {
		setEditingIndex(index);
		setEditingValue(value[index]);
	};

	const finishEditing = () => {
		if (editingIndex !== null) {
			updateItem(editingIndex, editingValue);
		}
		setEditingIndex(null);
		setEditingValue('');
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			finishEditing();
		} else if (e.key === 'Escape') {
			setEditingIndex(null);
			setEditingValue('');
		}
	};

	const isObjectArray = field.items.type === 'object';
	const properties = isObjectArray ? Object.keys(field.items.properties || {}) : [];

	// TODO validations
	// Simple array display for non-object types
	const renderSimpleArray = () => (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-medium">
					{field.title}
					{field.mandatory && <span className="text-destructive ml-1">*</span>}
				</Label>
				<Button
					className="flex items-center"
					size="sm"
					variant="outline"
					onClick={addItem}
				>
					<Plus className="w-4 h-4 mr-1" />
					Add
				</Button>
			</div>

			{field.description && (
				<p className="text-xs text-muted-foreground">{field.description}</p>
			)}

			<Card className="border-muted">
				<CardContent className="p-4">
					{value.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No items added yet. Click "Add" to create your first item.
						</div>
					) : (
						<div className="flex flex-wrap gap-2">
							{value.map((item, index) => (
								<div
									className="group relative inline-flex items-center bg-secondary/60 hover:bg-secondary/80 border rounded-full px-3 py-1.5 text-sm transition-colors"
									key={index}
								>
									{editingIndex === index ? (
										<input
											autoFocus
											className="bg-transparent border-none outline-none min-w-[60px] max-w-[200px] text-sm"
											type="text"
											value={editingValue}
											onBlur={finishEditing}
											onChange={(e) => setEditingValue(e.target.value)}
											onKeyDown={handleKeyDown}
										/>
									) : (
										<span
											className="cursor-pointer select-none"
											onClick={() => startEditing(index)}
										>
											{item || '@ Click to edit @'}
										</span>
									)}
									<button
										className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-destructive"
										onClick={() => removeItem(index)}
									>
										<X className="w-3 h-3" />
									</button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{errors.map((error, idx) => (
				<Alert className="py-2" key={idx} variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription className="text-xs">
						{error}
					</AlertDescription>
				</Alert>
			))}
		</div>
	);

	// Table display for object arrays
	const renderObjectArray = () => (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-medium">
					{field.title}
					{field.mandatory && <span className="text-destructive ml-1">*</span>}
				</Label>
				<Button
					className="flex items-center"
					size="sm"
					variant="outline"
					onClick={addItem}
				>
					<Plus className="w-4 h-4 mr-1" />
					Add
				</Button>
			</div>

			{field.description && (
				<p className="text-xs text-muted-foreground">{field.description}</p>
			)}

			<TooltipProvider>
				<Card className="border-muted">
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									{properties.map(propKey => {
										const property = field.items.properties[propKey];
										return (
											<TableHead className="min-w-[150px]" key={propKey}>
												<div className="flex items-center space-x-1">
													<span>{property.title || propKey}</span>
													{property.mandatory && <span className="text-destructive">*</span>}
													{property.description && (
														<Tooltip>
															<TooltipTrigger asChild>
																<HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
															</TooltipTrigger>
															<TooltipContent>
																<div className="max-w-xs text-sm">
																	{property.description}
																</div>
															</TooltipContent>
														</Tooltip>
													)}
												</div>
											</TableHead>
										);
									})}
									<TableHead className="w-[100px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{value.length === 0 ? (
									<TableRow>
										<TableCell className="text-center py-8 text-muted-foreground" colSpan={properties.length + 1}>
											No items added yet. Click "Add" to create your first item.
										</TableCell>
									</TableRow>
								) : (
									value.map((item, index) => (
										<TableRow key={index}>
											{properties.map(propKey => {
												const property = field.items.properties[propKey];
												return (
													<TableCell className="p-2" key={propKey}>
														<FieldInput
															compact
															field={{ ...property, title: property.title || propKey }}
															value={item[propKey]}
															onChange={(val) => updateItemProperty(index, propKey, val)}
														/>
													</TableCell>
												);
											})}
											<TableCell className="p-2">
												<Button
													className="flex items-center"
													size="sm"
													variant="destructive"
													onClick={() => removeItem(index)}
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</TooltipProvider>

			{errors.map((error, idx) => (
				<Alert className="py-2" key={idx} variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription className="text-xs">
						{error}
					</AlertDescription>
				</Alert>
			))}
		</div>
	);

	// Choose rendering method based on array type
	return isObjectArray ? renderObjectArray() : renderSimpleArray();
};

export default ArrayEditor; 