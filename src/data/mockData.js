// Mock data for demonstration
export const mockWebsites = [
	{
		id: '1', name: 'Main Store', sitetype: 'STANDARD', domains: [
			{ name: 'shopping.netsuite.com', primary: false },
			{ name: 'store.example.com', primary: true }
		]
	},
	{
		id: '2', name: 'B2B Portal', sitetype: 'ADVANCED', domains: [
			{ name: 'b2b.example.com', primary: true }
		]
	}
];

export const mockManifest = [
	{
		group: { id: 'general', title: 'General Settings', docRef: 'general_help' },
		properties: {
			siteName: {
				type: 'string',
				title: 'Site Name',
				description: 'The display name for your site',
				default: 'My Store',
				group: 'general',
				mandatory: true
			},
			enableFeature: {
				type: 'boolean',
				title: 'Enable Advanced Features',
				description: 'Enable advanced functionality',
				default: false,
				group: 'general'
			},
			maxItems: {
				type: 'integer',
				title: 'Maximum Items',
				description: 'Maximum number of items to display',
				default: 10,
				group: 'general'
			}
		}
	},
	{
		group: { id: 'appearance', title: 'Appearance', docRef: 'appearance_help' },
		subtab: { id: 'colors', title: 'Colors', group: 'appearance' },
		properties: {
			primaryColor: {
				type: 'string',
				title: 'Primary Color',
				description: 'Main brand color',
				default: '#007bff',
				group: 'appearance',
				subtab: 'colors'
			},
			theme: {
				type: 'enum',
				title: 'Theme',
				description: 'Select site theme',
				enum: ['light', 'dark', 'auto'],
				default: 'light',
				group: 'appearance'
			},
			categories: {
				type: 'array',
				title: 'Product Categories',
				description: 'List of product categories',
				items: {
					type: 'object',
					properties: {
						name: { type: 'string', title: 'Category Name' },
						enabled: { type: 'boolean', title: 'Enabled' }
					}
				},
				group: 'appearance',
				default: [
					{ name: 'Electronics', enabled: true },
					{ name: 'Clothing', enabled: false }
				]
			}
		}
	}
];

export const mockExistingConfig = {
	siteName: 'My Example Store',
	enableFeature: true,
	maxItems: 25,
	primaryColor: '#007bff',
	theme: 'light',
	categories: [
		{ name: 'Electronics', enabled: true },
		{ name: 'Clothing', enabled: false }
	]
}; 