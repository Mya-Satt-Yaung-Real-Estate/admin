# RT Admin Panel

A modern, responsive admin panel built with React, TypeScript, and Material-UI.

## 🚀 Tech Stack

### Core Framework & Build Tools
- **React 19** - Latest React with concurrent features
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript

### UI Framework & Components
- **Material-UI (MUI) v7** - React UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Performant forms with easy validation

### Data Management & API
- **React Query (TanStack Query)** - Server state management
- **Zustand** - Lightweight state management
- **Axios** - HTTP client

### Routing & Navigation
- **React Router v6** - Client-side routing
- **React Helmet Async** - Document head management

### Data Visualization
- **Recharts** - Composable charting library
- **TanStack Table** - Powerful table component

### Development Tools
- **ESLint + Prettier** - Code linting and formatting
- **Husky + lint-staged** - Git hooks for code quality
- **Jest + React Testing Library** - Testing framework
- **Storybook** - Component development environment

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (AdminLayout, PageHeader)
│   ├── ui/             # Basic UI components (LoadingSpinner, etc.)
│   └── common/         # Common components
├── pages/              # Page components
│   ├── dashboard/      # Dashboard page
│   ├── users/          # User management page
│   ├── analytics/      # Analytics page with charts
│   ├── settings/       # Settings page
│   └── auth/           # Authentication pages
├── routes/             # Routing configuration
├── stores/             # Zustand stores
├── services/           # API services
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── styles/             # Theme and global styles
└── assets/             # Static assets
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run storybook` - Start Storybook
- `npm run build-storybook` - Build Storybook

## 🎨 Features

### ✅ Implemented
- **Responsive Admin Layout** - Collapsible sidebar with navigation
- **User Management** - CRUD operations with search and filtering
- **Dashboard** - Overview with statistics and recent activities
- **Analytics** - Charts and data visualization
- **Settings** - Configuration management
- **Authentication** - Login page with form validation
- **Modern UI** - Material-UI components with custom theme
- **Type Safety** - Full TypeScript coverage
- **Code Quality** - ESLint, Prettier, and Husky setup

### 🚧 Planned
- **Advanced Analytics** - More detailed charts and reports
- **User Roles & Permissions** - Role-based access control
- **Real-time Updates** - WebSocket integration
- **File Management** - Upload and manage files
- **Notifications** - Real-time notifications
- **Dark Mode** - Theme switching
- **Internationalization** - Multi-language support

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001/api
```

### Theme Customization
Edit `src/styles/theme.ts` to customize the Material-UI theme.

## 🧪 Testing

The project uses Jest and React Testing Library for testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Material-UI](https://mui.com/) for the component library
- [Vite](https://vitejs.dev/) for the build tool
- [React Query](https://tanstack.com/query) for server state management
- [Zustand](https://zustand-demo.pmnd.rs/) for state management
