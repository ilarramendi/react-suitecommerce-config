import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Label } from './ui/label';

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
							<Label htmlFor="website-select" className="text-sm font-medium mb-2 block">
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
								<Label htmlFor="domain-select" className="text-sm font-medium mb-2 block">
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
							onClick={handleConfigure}
							disabled={!selectedWebsite || !selectedDomain}
							className="flex-1"
						>
							Configure
						</Button>

						<Button variant="secondary" className="flex items-center">
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