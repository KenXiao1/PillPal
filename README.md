# MediTrack - Medication Compliance System

A comprehensive medication compliance tracking system designed for elderly patients and their caregivers to manage medications, track adherence, and access health education resources.

## Features

### For Patients

#### Medication Management
- Add and manage multiple medications with custom dosages
- Create flexible schedules with day-of-week patterns
- View today's medication schedule with time-specific reminders
- Mark doses as taken or skipped
- Track medication compliance history

#### Health Education
- Access curated health articles about chronic disease management
- Topics include:
  - **Hypertension Management**: Understanding blood pressure, dietary tips (DASH diet), lifestyle modifications
  - **Diabetes Care**: Blood sugar management, symptoms, risk factors, and prevention strategies
  - **Heart Health**: Maintaining cardiovascular health as you age
  - **Nutrition Guide**: Healthy eating advice for managing chronic conditions
  - **Exercise for Seniors**: Safe and effective physical activities
  - **Medication Safety**: Best practices for taking medications correctly
- Bookmark articles for later reading
- Track reading progress
- Estimated reading times for each article

#### Caregiver Connections
- Connect with family members and caregivers
- Share medication schedules and compliance data
- Keep loved ones informed about your health management

### For Caregivers

#### Patient Monitoring
- View all connected patients in one dashboard
- See real-time medication compliance rates
- Track missed doses for each patient
- Monitor multiple medications per patient
- View relationship type for each patient connection (e.g., daughter, son, spouse, family member)

#### Alert System
- Receive instant notifications when patients miss doses
- Review unread alerts in a centralized panel
- Mark alerts as read to stay organized
- Real-time updates on patient medication adherence

#### Family Member Support
- Designate relationship types when connecting with patients
- Customize notification preferences per patient
- Support multiple caregiver roles (family members, professional caregivers)

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Build Tool**: Vite

## Database Schema

### Core Tables

#### `profiles`
User profiles with role-based access (patient or caregiver)
- Links to Supabase Auth users
- Stores user information and role designation

#### `medications`
Medication information for patients
- Name, dosage, and special instructions
- Active/inactive status for prescription management
- Linked to patient profiles

#### `schedules`
Flexible medication schedules
- Time-of-day dosing
- Day-of-week patterns (supports complex schedules)
- Multiple schedules per medication

#### `dose_logs`
Complete audit trail of medication adherence
- Tracks scheduled, taken, missed, and skipped doses
- Timestamp logging for compliance analytics
- Optional patient notes

#### `caregiver_connections`
Family and caregiver relationships
- Links patients with caregivers
- Relationship designation (daughter, son, family member, etc.)
- Notification preferences
- Unique constraint prevents duplicate connections

#### `alerts`
Real-time notification system
- Missed dose alerts sent to caregivers
- Read/unread status tracking
- Alert history for review

#### `health_topics`
Educational content categories
- Topics: hypertension, diabetes, heart health, diet, exercise, medication safety
- Organized with display order

#### `health_articles`
Health education content library
- Full articles with formatted content
- Reading time estimates
- Publication dates
- Linked to topics

#### `user_article_progress`
Reading progress tracking
- Tracks which articles users have read
- Bookmark functionality
- Personal learning history

## Security

### Row Level Security (RLS)
All tables are protected with comprehensive RLS policies:

- **Patients** can only access their own data
- **Caregivers** can view data for connected patients only
- **Health education** content is accessible to all authenticated users
- **User progress** is strictly private
- No unauthorized access to sensitive health information

### Data Privacy
- HIPAA-like compliance patterns
- Secure authentication through Supabase
- Protected API endpoints
- No data exposure to unauthenticated users

## Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd meditrack
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations:

The migrations are already available in `supabase/migrations/`:
- `create_medication_compliance_schema.sql` - Core medication tracking system
- `add_health_education_system.sql` - Health education features

Apply these migrations through your Supabase dashboard or CLI.

5. Start the development server:
```bash
npm run dev
```

6. Open your browser to `http://localhost:5173`

## Usage

### Getting Started

#### As a Patient

1. **Sign Up**
   - Create an account with email and password
   - Select "Patient" as your role
   - Enter your full name

2. **Add Medications**
   - Click "Add" in the My Medications section
   - Enter medication name and dosage
   - Add special instructions if needed
   - Set the time for doses
   - Select which days to take the medication

3. **Track Daily Doses**
   - View today's schedule on your dashboard
   - Mark each dose as "Taken" or "Skip" as needed
   - See your compliance rate

4. **Connect Caregivers**
   - Add family members or professional caregivers
   - They'll be able to monitor your medication adherence
   - Specify your relationship (e.g., "daughter", "family member")

5. **Access Health Education**
   - Click "Explore Articles" in the Health Education section
   - Browse articles by topic
   - Read articles about managing your specific conditions
   - Bookmark helpful articles for later

#### As a Caregiver

1. **Sign Up**
   - Create an account with email and password
   - Select "Caregiver" as your role
   - Enter your full name

2. **Get Connected**
   - Ask your loved ones (patients) to add you as a caregiver
   - They'll specify your relationship to them

3. **Monitor Patients**
   - View all connected patients on your dashboard
   - Check daily compliance rates
   - See number of missed doses
   - Review active medications for each patient

4. **Manage Alerts**
   - Receive notifications when patients miss doses
   - Review alerts in the Alerts panel
   - Mark alerts as read after following up

### Best Practices

#### For Patients
- Set up your medications at the beginning of treatment
- Check your dashboard daily to stay on track
- Mark doses promptly to maintain accurate records
- Read health education articles to better understand your conditions
- Keep your caregiver connections up to date

#### For Caregivers
- Check the dashboard regularly for updates
- Respond to missed dose alerts promptly
- Communicate with patients about their medication adherence
- Use the relationship field to help patients identify you easily

## Project Structure

```
meditrack/
├── src/
│   ├── components/
│   │   ├── AuthForm.tsx           # Login/signup interface
│   │   ├── CaregiverDashboard.tsx # Caregiver monitoring interface
│   │   ├── PatientDashboard.tsx   # Patient medication management
│   │   └── HealthEducation.tsx    # Health education content viewer
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication state management
│   ├── lib/
│   │   └── supabase.ts           # Supabase client and type definitions
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global styles
├── supabase/
│   └── migrations/                # Database migration files
├── public/                        # Static assets
├── .env                          # Environment variables (not in repo)
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts               # Vite build configuration
└── README.md                    # This file
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Contributing

This is a healthcare application dealing with sensitive medical information. When contributing:

1. Maintain strict adherence to security best practices
2. Ensure all new tables have proper RLS policies
3. Never expose sensitive data in logs or error messages
4. Follow the existing code style and patterns
5. Test thoroughly before submitting changes

## Health Education Content

The system includes pre-populated health education articles covering:

### Hypertension (High Blood Pressure)
- Understanding blood pressure readings
- Dietary approaches (DASH diet)
- Foods that help lower blood pressure
- Lifestyle modifications

### Diabetes Management
- Understanding Type 2 diabetes
- Blood sugar management
- Recognizing symptoms and complications
- Prevention strategies

### Exercise Guidelines
- Safe exercises for seniors
- Aerobic activities
- Strength training recommendations
- Balance and flexibility routines

### Medication Safety
- Taking medications correctly
- Storage guidelines
- Managing side effects
- Understanding drug interactions

All content is evidence-based and written in accessible language for elderly users.

## Future Enhancements

Potential features for future development:
- SMS/Email notifications for missed doses
- Medication refill reminders
- Prescription photo uploads
- Integration with pharmacy systems
- Multi-language support
- Voice-activated medication logging
- Health metrics tracking (blood pressure, blood sugar)
- Report generation for doctor visits
- Medication interaction warnings
- Insurance information management

## Support

For issues, questions, or feature requests, please contact the development team or open an issue in the repository.

## 📄 许可证

本项目采用 GPL-3.0 license 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
