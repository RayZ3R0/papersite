
import Link from 'next/link';

interface Props {
  message?: string;
  requiresLogin?: boolean;
}

export default function ForbiddenMessage({ 
  message = 'You don\'t have permission to view this content',
  requiresLogin = true 
}: Props) {
  return (
    <div className="text-center p-8 bg-surface rounded-lg">
      <p className="text-text-muted mb-4">{message}</p>
      {requiresLogin && (
        <Link 
          href="/auth/login" 
          className="text-primary hover:underline"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}

export function AdminOnlyMessage() {
  return (
    <ForbiddenMessage 
      message="This content is only visible to administrators"
      requiresLogin={false}
    />
  );
}

export function ModOnlyMessage() {
  return (
    <ForbiddenMessage 
      message="This content is only visible to moderators and administrators"
      requiresLogin={false}  
    />
  );
}