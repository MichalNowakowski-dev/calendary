import { NextRequest, NextResponse } from 'next/server';
import { getCompanyPermissions } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const permissions = await getCompanyPermissions(companyId);

    if (!permissions) {
      return NextResponse.json(
        { error: 'No permissions found for company' },
        { status: 404 }
      );
    }

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}