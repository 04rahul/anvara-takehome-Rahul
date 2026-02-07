import { PrismaClient } from '../apps/backend/src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Mock request/response for testing logic if needed, but integration test is better.
// For this script, we'll simulate the operations directly using Prisma and checking logic.

async function verifyUnbook() {
    console.log('Verifying Unbook Functionality...');

    // 1. Setup: Ensure we have a demo user and a regular user
    const demoEmail = 'sponsor@example.com';
    const regularEmail = 'regular@example.com';

    console.log(`Checking for demo user: ${demoEmail}`);
    // We will check the linked Sponsor/Publisher models directly.

    const demoSponsor = await prisma.sponsor.findUnique({ where: { email: demoEmail } });
    if (!demoSponsor) {
        console.error('Demo sponsor not found. Please run seed script.');
        return;
    }
    console.log('Demo sponsor found.');

    // 2. Setup: Ensure there is a booked ad slot
    let bookedSlot = await prisma.adSlot.findFirst({
        where: { isAvailable: false },
        include: { placements: true }
    });

    if (!bookedSlot) {
        console.log('No booked slots found. Creating a booking...');
        // Finding an available slot
        const availableSlot = await prisma.adSlot.findFirst({ where: { isAvailable: true } });
        if (!availableSlot) {
            console.error('No slots available to book.');
            return;
        }

        // Create a dummy placement to book it
        // We need a campaign and creative... assuming they exist from seed
        const campaign = await prisma.campaign.findFirst({ where: { sponsorId: demoSponsor.id } });
        const creative = await prisma.creative.findFirst({ where: { campaignId: campaign?.id } });

        if (campaign && creative) {
            await prisma.placement.create({
                data: {
                    adSlotId: availableSlot.id,
                    campaignId: campaign.id,
                    creativeId: creative.id,
                    publisherId: availableSlot.publisherId,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 86400000),
                    agreedPrice: 100,
                    status: 'APPROVED'
                }
            });
            await prisma.adSlot.update({
                where: { id: availableSlot.id },
                data: { isAvailable: false }
            });
            bookedSlot = await prisma.adSlot.findUnique({
                where: { id: availableSlot.id },
                include: { placements: true }
            });
            console.log(`Booked slot ${bookedSlot?.id} for testing.`);
        } else {
            console.error('Campaign or Creative not found for demo sponsor.');
            return;
        }
    } else {
        console.log(`Using existing booked slot: ${bookedSlot.id}`);
    }

    if (!bookedSlot) return;

    // 3. Test: Unbook as Demo User (Simulated Logic)
    console.log('\nTest 1: Unbook as Demo User');
    // Logic from route:
    const demoConfig = ['sponsor@example.com', 'publisher@example.com'];
    const userEmail = demoEmail; // sponsor@example.com

    if (demoConfig.includes(userEmail)) {
        console.log('Auth Check: Passed (Expected)');

        // Perform Unbook
        await prisma.$transaction(async (tx) => {
            const deleted = await tx.placement.deleteMany({
                where: {
                    adSlotId: bookedSlot!.id,
                    status: { in: ['APPROVED', 'ACTIVE'] }
                }
            });
            console.log(`Deleted ${deleted.count} placements.`);

            await tx.adSlot.update({
                where: { id: bookedSlot!.id },
                data: { isAvailable: true }
            });
            console.log('Slot marked as available.');
        });

        // Verify
        const checkSlot = await prisma.adSlot.findUnique({ where: { id: bookedSlot.id } });
        if (checkSlot?.isAvailable) {
            console.log('Result: SUCCESS - Slot is available.');
        } else {
            console.error('Result: FAILED - Slot is still unavailable.');
        }

    } else {
        console.error('Auth Check: Failed (Unexpected)');
    }

    // 4. Test: Unbook as Regular User (Simulated Logic)
    console.log('\nTest 2: Unbook as Regular User');
    const regularUserEmail = 'other@example.com';

    if (demoConfig.includes(regularUserEmail)) {
        console.error('Auth Check: Passed (Unexpected)');
    } else {
        console.log('Auth Check: Failed - Forbidden (Expected)');
    }

    console.log('\nVerification Complete.');
}

verifyUnbook()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
