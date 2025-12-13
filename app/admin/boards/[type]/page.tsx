
import { redirect } from 'next/navigation';

export default async function AdminBoardDetailPage(props: {
    params: Promise<{ type: string }>;
}) {
    const params = await props.params;
    // Reuse the unified board page, which has role-based admin features.
    // However, if we want a specific "Admin Mode Layout", we might wrap it here.
    // For now, redirecting to the standard unified route is cleanest.
    redirect(`/boards/${params.type}`);
}
