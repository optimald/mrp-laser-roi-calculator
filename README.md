# MRP Aesthetics Laser ROI Calculator

A comprehensive financial analysis tool for aesthetics laser equipment purchases, built with React, TypeScript, and Vite.

## 🚀 Features

- **Complete Financial Modeling**: TCO and ROI calculations for laser equipment
- **Real-time Analysis**: Live updates of KPIs and financial metrics
- **Interactive Charts**: Visual representation of cash flow and profitability
- **Professional Reports**: PDF export with branded reports
- **Dark Theme**: Modern, professional UI with MRP branding
- **Responsive Design**: Works seamlessly on desktop and mobile

## 📊 Key Metrics Calculated

- Monthly payment and revenue projections
- EBITDA and cash flow analysis
- Breakeven point (treatments per day)
- Payback period and NPV/IRR
- Comprehensive P&L statements
- Sensitivity analysis capabilities

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Charts**: Chart.js with React integration
- **PDF Export**: jsPDF + html2canvas
- **Build Tool**: Vite
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd mrp-calc

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 📱 Usage

1. **Input Parameters**: Use the left panel to configure:
   - Device specifications and pricing
   - Financing terms and options
   - Utilization and capacity planning
   - Revenue and pricing models
   - Variable and fixed costs

2. **View Results**: The right panel displays:
   - Key performance indicators
   - Interactive financial charts
   - Monthly P&L summaries
   - Breakeven analysis

3. **Export Reports**: Generate professional PDF reports with:
   - Executive summary
   - Detailed assumptions
   - Financial projections
   - Charts and tables

## 🎨 Customization

The application uses a custom dark theme with MRP branding. Key styling files:
- `src/index.css` - Global styles and Tailwind imports
- `src/App.css` - Component-specific styles
- `tailwind.config.js` - Tailwind configuration

## 📈 Financial Calculations

The calculator implements comprehensive financial modeling including:

- **Loan Payments**: PMT calculations with various terms
- **Depreciation**: Straight-line and MACRS methods
- **Tax Implications**: Tax shields and effective rates
- **Cash Flow Analysis**: Monthly and cumulative projections
- **Investment Metrics**: NPV, IRR, and payback analysis

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Header.tsx      # Application header with logo
│   ├── InputPanel.tsx  # Parameter input forms
│   ├── ResultsPanel.tsx # Results display
│   ├── KPICards.tsx    # Key metrics cards
│   └── Charts.tsx      # Financial charts
├── utils/              # Utility functions
│   ├── calculations.ts # Financial calculations
│   └── pdfExport.ts    # PDF generation
└── assets/             # Static assets
    └── images/         # Logo and images
```

### Key Components

- **InputPanel**: Collapsible sections for all input parameters
- **KPICards**: Visual display of key financial metrics
- **Charts**: Interactive financial charts using Chart.js
- **PDF Export**: Professional report generation

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options

**Netlify:**
```bash
npm run deploy:netlify
```

**Vercel:**
```bash
npm run deploy:vercel
```

## 📋 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔒 Security & Privacy

- All calculations performed client-side
- No data transmitted to external servers
- PDF generation uses local processing
- No sensitive information stored

## 📄 License

This project is proprietary software developed for MRP.

## 🤝 Support

For technical support or feature requests, please contact the development team.

---

Built with ❤️ for MRP Aesthetics