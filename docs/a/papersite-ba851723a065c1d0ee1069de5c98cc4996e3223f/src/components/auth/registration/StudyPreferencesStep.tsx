import { StudyPreferences, StudyTime } from '@/types/registration';

interface StudyPreferencesStepProps {
  preferences: StudyPreferences;
  onChange: (preferences: StudyPreferences) => void;
  errors?: {
    dailyStudyHours?: string;
    preferredStudyTime?: string;
  };
}

const STUDY_TIME_OPTIONS: { label: string; value: StudyTime }[] = [
  { label: 'Morning', value: 'morning' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Evening', value: 'evening' },
  { label: 'Night', value: 'night' },
];

export function StudyPreferencesStep({
  preferences,
  onChange,
  errors
}: StudyPreferencesStepProps) {
  const handleChange = (field: keyof StudyPreferences, value: any) => {
    onChange({
      ...preferences,
      [field]: value
    });
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {/* Daily Study Hours */}
      <div className="space-y-2">
        <label
          htmlFor="dailyStudyHours"
          className="block text-sm font-medium text-text"
        >
          Daily Study Hours
        </label>
        <div className="relative">
          <input
            type="number"
            id="dailyStudyHours"
            min={1}
            max={12}
            value={preferences.dailyStudyHours || ''}
            onChange={(e) => handleChange('dailyStudyHours', Number(e.target.value))}
            placeholder="Enter hours (1-12)"
            className={`
              block w-full px-4 py-3 rounded-lg text-base
              bg-surface border-2 transition duration-200 outline-none
              placeholder:text-text-muted/60
              ${errors?.dailyStudyHours 
                ? 'border-error' 
                : 'border-border hover:border-primary/50 focus:border-primary'
              }
            `}
          />
          {errors?.dailyStudyHours && (
            <p className="mt-2 text-sm text-error font-medium">
              {errors.dailyStudyHours}
            </p>
          )}
        </div>
      </div>

      {/* Preferred Study Time */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text mb-3">
          Preferred Study Time
        </label>
        <div className="grid grid-cols-2 gap-3">
          {STUDY_TIME_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleChange('preferredStudyTime', value)}
              className={`
                p-3 rounded-lg border-2 text-center transition-all duration-200
                ${preferences.preferredStudyTime === value
                  ? 'border-primary bg-primary/5 text-text'
                  : 'border-border text-text-muted hover:border-primary/50'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
        {errors?.preferredStudyTime && (
          <p className="mt-2 text-sm text-error font-medium">
            {errors.preferredStudyTime}
          </p>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text">
          Notifications
        </label>
        <button
          type="button"
          onClick={() => handleChange('notifications', !preferences.notifications)}
          className={`
            w-full p-4 rounded-lg border-2 text-left transition-all duration-200
            ${preferences.notifications
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text">Study Reminders</h3>
              <p className="text-sm text-text-muted mt-1">
                Receive notifications for study sessions and deadlines
              </p>
            </div>
            <div className={`
              w-6 h-6 rounded-full border-2 transition-colors
              flex items-center justify-center
              ${preferences.notifications
                ? 'border-primary bg-primary text-white'
                : 'border-border'
              }
            `}>
              {preferences.notifications && (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}