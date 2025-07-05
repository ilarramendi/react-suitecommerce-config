import React from 'react';
import { Plus, Trash2, AlertCircle, HelpCircle } from 'lucide-react';
import FieldInput from './FieldInput';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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

	const updateItemProperty = (index, propKey, propValue) => {
		const newValue = [...value];
		newValue[index] = { ...newValue[index], [propKey]: propValue };
		onChange(newValue);
	};

	const isObjectArray = field.items.type === 'object';
	const properties = isObjectArray ? Object.keys(field.items.properties || {}) : [];

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

			<TooltipProvider>
				<Card className="border-muted">
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									{isObjectArray ? (
										properties.map(propKey => {
											const property = field.items.properties[propKey];
											return (
												<TableHead key={propKey} className="min-w-[150px]">
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
										})
									) : (
										<TableHead>
											<div className="flex items-center space-x-1">
												<span>{field.items.title || 'Value'}</span>
												{field.items.description && (
													<Tooltip>
														<TooltipTrigger asChild>
															<HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
														</TooltipTrigger>
														<TooltipContent>
															<div className="max-w-xs text-sm">
																{field.items.description}
															</div>
														</TooltipContent>
													</Tooltip>
												)}
											</div>
										</TableHead>
									)}
									<TableHead className="w-[100px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{value.length === 0 ? (
									<TableRow>
										<TableCell colSpan={isObjectArray ? properties.length + 1 : 2} className="text-center py-8 text-muted-foreground">
											No items added yet. Click "Add" to create your first item.
										</TableCell>
									</TableRow>
								) : (
									value.map((item, index) => (
										<TableRow key={index}>
											{isObjectArray ? (
												properties.map(propKey => {
													const property = field.items.properties[propKey];
													return (
														<TableCell key={propKey} className="p-2">
															<FieldInput
																field={{ ...property, title: property.title || propKey }}
																value={item[propKey]}
																onChange={(val) => updateItemProperty(index, propKey, val)}
																compact={true}
															/>
														</TableCell>
													);
												})
											) : (
												<TableCell className="p-2">
													<FieldInput
														field={field.items}
														value={item}
														onChange={(val) => updateItem(index, val)}
														compact={true}
													/>
												</TableCell>
											)}
											<TableCell className="p-2">
												<Button
													variant="destructive"
													size="sm"
													onClick={() => removeItem(index)}
													className="flex items-center"
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