import React, { useEffect } from 'react';

import { useToast } from '../hooks/use-toast';

import { Button } from './ui/button';

const Header = ({ currentView, saveStatus, onBack }) => {
	const { toast } = useToast();

	useEffect(() => {
		if (saveStatus === 'success') {
			toast({
				title: "Success",
				description: "Configuration saved successfully",
				duration: 3000,
			});
		}
	}, [saveStatus, toast]);

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
							<Button
								className="px-4 py-2"
								variant="secondary"
								onClick={onBack}
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