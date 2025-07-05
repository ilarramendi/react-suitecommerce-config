import React, { useState } from 'react';

import Footer from './components/Footer';
import Header from './components/Header';
import SchemaEditor from './components/SchemaEditor';
import { Toaster } from './components/ui/toaster';
import WebsiteSelector from './components/WebsiteSelector';
import mockExistingConfig from './data/config.json';
import extraManifest from './data/extra-manifest.json';
import baseManifest from './data/manifest.json';
import { mockWebsites } from './data/mockData';


const mockManifest = [
	...extraManifest,
	...baseManifest,
];

const SuiteCommerceConfigApp = () => {
	const [currentView, setCurrentView] = useState('selector'); // 'selector' | 'editor'
	const [selectedConfig, setSelectedConfig] = useState(null);
	const [configuration, setConfiguration] = useState({});
	const [saveStatus, setSaveStatus] = useState(null);

	const handleWebsiteSelect = (selection) => {
		setSelectedConfig(selection);
		// Load existing configuration for this website/domain
		setConfiguration(mockExistingConfig);
		setCurrentView('editor');
	};

	const handleSave = async (config) => {
		try {
			setSaveStatus('saving');
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			setConfiguration(config);
			setSaveStatus('success');
			setTimeout(() => setSaveStatus(null), 3000);
		} catch (error) {
			setSaveStatus('error');
			setTimeout(() => setSaveStatus(null), 3000);
		}
	};

	const handleBack = () => {
		setCurrentView('selector');
		setSelectedConfig(null);
	};

	return (
		<div className="min-h-screen bg-background text-foreground">
			<Header
				currentView={currentView}
				saveStatus={saveStatus}
				onBack={handleBack}
			/>

			<main className="py-8">
				{currentView === 'selector' ? (
					<WebsiteSelector
						websites={mockWebsites}
						onSelect={handleWebsiteSelect}
					/>
				) : (
					<SchemaEditor
						configuration={configuration}
						manifest={mockManifest}
						onSave={handleSave}
					/>
				)}
			</main>

			<Footer />
			<Toaster />
		</div>
	);
};

export default SuiteCommerceConfigApp;