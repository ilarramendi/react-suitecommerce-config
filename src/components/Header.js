import React from 'react';
import { CheckCircle } from 'lucide-react';

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
								<div className="flex items-center text-green-600">
									<CheckCircle className="w-5 h-5 mr-2" />
									Configuration saved successfully
								</div>
							)}
							<button
								onClick={onBack}
								className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
							>
								Back to Selection
							</button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header; 