import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm';
import { RecoverySessionHandler } from '@/components/auth/RecoverySessionHandler';

export const metadata = {
  title: 'Update password',
};

export default function UpdatePasswordPage() {
  return (
    <RecoverySessionHandler>
      <div className="flex flex-col items-center px-4">
        <h1 className="mb-6 text-xl font-semibold tracking-tight text-gray-900">
          Set new password
        </h1>
        <p className="text-gray-600 mb-6 text-center max-w-sm">
          You arrived here from the password reset link. Enter your new password
          below.
        </p>
        <UpdatePasswordForm />
      </div>
    </RecoverySessionHandler>
  );
}
