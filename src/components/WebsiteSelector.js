import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';

const WebsiteSelector = ({ websites, onSelect }) => {
	const [selectedWebsite, setSelectedWebsite] = useState('');
	const [selectedDomain, setSelectedDomain] = useState('');
	const [availableDomains, setAvailableDomains] = useState([]);

	useEffect(() => {
		if (selectedWebsite) {
			const website = websites.find(w => w.id === selectedWebsite);
			setAvailableDomains(website?.domains || []);
			setSelectedDomain('');
		}
	}, [selectedWebsite, websites]);

	const handleConfigure = () => {
		if (selectedWebsite && selectedDomain) {
			onSelect({ websiteId: selectedWebsite, domain: selectedDomain });
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="bg-white rounded-lg shadow-md p-8 space-y-6">
				<h1 className="text-3xl font-bold text-gray-900 text-center">
					SuiteCommerce Configuration
				</h1>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Select Website
						</label>
						<select
							value={selectedWebsite}
							onChange={(e) => setSelectedWebsite(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Pick one</option>
							{websites.map(website => (
								<option key={website.id} value={website.id}>
									{website.name}
								</option>
							))}
						</select>
					</div>

					{selectedWebsite && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Select Domain
							</label>
							<select
								value={selectedDomain}
								onChange={(e) => setSelectedDomain(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Pick one</option>
								{availableDomains.map((domain, idx) => (
									<option key={idx} value={domain.name}>
										{domain.name} {domain.primary ? '(Primary)' : ''}
									</option>
								))}
							</select>
						</div>
					)}
				</div>

				<div className="flex space-x-4">
					<button
						onClick={handleConfigure}
						disabled={!selectedWebsite || !selectedDomain}
						className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Configure
					</button>

					<button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
						<Copy className="w-4 h-4 mr-2" />
						Copy Configuration
					</button>
				</div>
			</div>
		</div>
	);
};

export default WebsiteSelector; 