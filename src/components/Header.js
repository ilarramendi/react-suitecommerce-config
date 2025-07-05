import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

const Header = ({ currentView, saveStatus, onBack }) => {
	return (
		<header className="bg-white shadow-sm border-b">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<h1 className="text-xl font-semibold text-gray-900">
							SuiteCommerce Configuration Manager
						</h1>
					</div>

					{currentView === 'editor' && (
						<div className="flex items-center space-x-4">
							{saveStatus === 'success' && (
								<Alert className="w-auto border-green-200 bg-green-50 px-3 py-2">
									<CheckCircle className="h-4 w-4 text-green-600" />
									<AlertDescription className="text-green-800 font-medium">
										Configuration saved successfully
									</AlertDescription>
								</Alert>
							)}
							<Button
								variant="secondary"
								onClick={onBack}
								className="px-4 py-2"
							>
								Back to Selection
							</Button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header; 