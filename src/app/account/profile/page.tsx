import type {Metadata} from 'next';
import { getAuthToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ChangePasswordForm } from './change-password-form';

export const metadata: Metadata = {
    title: 'Profile',
};

export default async function ProfilePage(_props: PageProps<'/account/profile'>) {
    const authToken = await getAuthToken();
    if (!authToken) {
        redirect('/sign-in');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Mi perfil</h1>
                <p className="text-foreground mt-2">
                    Administra la información de tu cuenta
                </p>
            </div>

            <ChangePasswordForm />
        </div>
    );
}
