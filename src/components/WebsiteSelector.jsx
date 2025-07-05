import { Copy } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
			<Card className="shadow-lg">
				<CardHeader className="text-center">
					<CardTitle className="text-3xl font-bold">
						SuiteCommerce Configuration
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<div>
							<Label className="text-sm font-medium mb-2 block" htmlFor="website-select">
								Select Website
							</Label>
							<Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
								<SelectTrigger id="website-select">
									<SelectValue placeholder="Pick one" />
								</SelectTrigger>
								<SelectContent>
									{websites.map(website => (
										<SelectItem key={website.id} value={website.id}>
											{website.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{selectedWebsite && (
							<div>
								<Label className="text-sm font-medium mb-2 block" htmlFor="domain-select">
									Select Domain
								</Label>
								<Select value={selectedDomain} onValueChange={setSelectedDomain}>
									<SelectTrigger id="domain-select">
										<SelectValue placeholder="Pick one" />
									</SelectTrigger>
									<SelectContent>
										{availableDomains.map((domain, idx) => (
											<SelectItem key={idx} value={domain.name}>
												{domain.name} {domain.primary ? '(Primary)' : ''}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>

					<div className="flex space-x-4">
						<Button
							className="flex-1"
							disabled={!selectedWebsite || !selectedDomain}
							onClick={handleConfigure}
						>
							Configure
						</Button>

						<Button className="flex items-center" variant="secondary">
							<Copy className="w-4 h-4 mr-2" />
							Copy Configuration
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default WebsiteSelector; 