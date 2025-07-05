import React from 'react';
import { HelpCircle, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';

const FieldInput = ({ field, value, onChange, errors = [], compact = false }) => {
	const hasError = errors.length > 0;

	const renderField = () => {
		switch (field.type) {
			case 'string':
			case 'text':
				return (
					<Input
						type="text"
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={compact ? field.title : field.description}
						className={`${hasError ? 'border-destructive' : ''} ${compact ? 'h-8' : ''}`}
					/>
				);

			case 'integer':
			case 'number':
				return (
					<Input
						type="number"
						value={value || ''}
						onChange={(e) => onChange(field.type === 'integer' ? parseInt(e.target.value) : parseFloat(e.target.value))}
						placeholder={compact ? field.title : field.description}
						className={`${hasError ? 'border-destructive' : ''} ${compact ? 'h-8' : ''}`}
					/>
				);

			case 'boolean':
			case 'checkbox':
				return (
					<div className="flex items-center space-x-2">
						<Checkbox
							id={field.id}
							checked={value || false}
							onCheckedChange={(checked) => onChange(checked)}
						/>
						{!compact && (
							<Label 
								htmlFor={field.id} 
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								{field.title}
							</Label>
						)}
					</div>
				);

			case 'enum':
			case 'select':
				return (
					<Select value={value || ''} onValueChange={(value) => onChange(value)}>
						<SelectTrigger className={`${hasError ? 'border-destructive' : ''} ${compact ? 'h-8' : ''}`}>
							<SelectValue placeholder={compact ? field.title : 'Select an option'} />
						</SelectTrigger>
						<SelectContent>
							{(field.enum || field.options || []).map((option, idx) => (
								<SelectItem key={idx} value={option}>
									{option}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);

			default:
				return (
					<Input
						type="text"
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={compact ? field.title : field.description}
						className={`${hasError ? 'border-destructive' : ''} ${compact ? 'h-8' : ''}`}
					/>
				);
		}
	};

	// In compact mode, just return the field without labels and descriptions
	if (compact) {
		return (
			<div className="space-y-1">
				{renderField()}
				{errors.map((error, idx) => (
					<Alert key={idx} variant="destructive" className="py-1">
						<AlertCircle className="h-3 w-3" />
						<AlertDescription className="text-xs">
							{error}
						</AlertDescription>
					</Alert>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center space-x-2">
				<Label className="text-sm font-medium">
					{field.title}
					{field.mandatory && <span className="text-destructive ml-1">*</span>}
				</Label>
				{field.docRef && (
					<HelpCircle
						className="w-4 h-4 text-muted-foreground cursor-help"
						title="Click for help documentation"
					/>
				)}
			</div>

			{field.type !== 'boolean' && field.type !== 'checkbox' && renderField()}
			{(field.type === 'boolean' || field.type === 'checkbox') && renderField()}

			{field.description && (
				<p className="text-xs text-muted-foreground">{field.description}</p>
			)}

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

export default FieldInput; 