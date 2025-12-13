
import { prisma } from '@/lib/prisma';
import { BoardType } from './board-config';

// Action Codes as per PRD
export type BoardAction = 'BOARD_LIST' | 'BOARD_READ' | 'BOARD_WRITE' | 'BOARD_EDIT' | 'BOARD_DELETE' | 'BOARD_COMMENT';

interface CheckPermissionParams {
    userId?: number;
    userRole?: string; // 'admin', 'user', etc.
    boardType: BoardType | string;
    action: BoardAction;
    isAuthor?: boolean; // For EDIT/DELETE checks
}

export async function checkBoardPermission(params: CheckPermissionParams): Promise<boolean> {
    const { userId, userRole, boardType, action, isAuthor } = params;

    // 1. Super Admin / Admin Bypass
    // Admin has full access to everything usually
    if (userRole === 'admin' || userRole === 'ADMIN' || userRole === 'super_admin') {
        return true;
    }

    // 2. Author Permissions (Context-based)
    // If user is author, they generally have EDIT/DELETE rights subject to policy.
    // However, policy might restrict "Edit after 24h". 
    // For now, we assume simple "Author can edit/delete own post".
    if (isAuthor) {
        if (action === 'BOARD_EDIT' || action === 'BOARD_DELETE') {
            return true;
        }
    }

    // LIST/READ/WRITE/COMMENT require checking the BoardPermission matrix
    try {
        // Fetch permission setting for this board and role
        // We might fallback to 'guest' if no userRole
        const targetRole = userRole || 'guest';

        const permission = await prisma.boardPermission.findUnique({
            where: {
                boardType_role: {
                    boardType: boardType.toString(),
                    role: targetRole
                }
            }
        });

        if (!permission) {
            // No specific permission set. Use Default Policies.
            return getDefaultPermission(boardType.toString(), targetRole, action);
        }

        // Actions are stored as JSON stirng or specific format. 
        // Schema definition: actions String @default("[]") // JSON array
        // We parse it.
        let allowedActions: string[] = [];
        try {
            allowedActions = JSON.parse(permission.actions);
        } catch (e) {
            console.error('Failed to parse permission actions', e);
            return false;
        }

        return allowedActions.includes(action);

    } catch (error) {
        console.error('Permission check failed:', error);
        return false;
    }
}

function getDefaultPermission(boardType: string, role: string, action: BoardAction): boolean {
    // Default Fallback Policy

    // Guest
    if (role === 'guest') {
        // Guests can usually LIST and READ
        if (action === 'BOARD_LIST' || action === 'BOARD_READ') return true;
        return false;
    }

    // Logged in User (pending, member, etc.)
    // Assuming 'member' or better
    if (['member', 'pastor', 'elder', 'evangelist'].includes(role)) {
        // Can LIST, READ, WRITE, COMMENT
        if (['BOARD_LIST', 'BOARD_READ', 'BOARD_WRITE', 'BOARD_COMMENT'].includes(action)) return true;
    }

    // Pending user
    if (role === 'pending') {
        if (action === 'BOARD_LIST' || action === 'BOARD_READ') return true;
    }

    return false;
}
