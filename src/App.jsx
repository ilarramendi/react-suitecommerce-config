import React, { useState } from 'react';
import { mockWebsites } from './data/mockData';
import mockExistingConfig from './data/config.json';
import baseManifest from './data/manifest.json';
import extraManifest from './data/extra-manifest.json';
import Header from './components/Header';
import Footer from './components/Footer';
import WebsiteSelector from './components/WebsiteSelector';
import SchemaEditor from './components/SchemaEditor';
import { Toaster } from './components/ui/toaster';


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
						manifest={mockManifest}
						configuration={configuration}
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