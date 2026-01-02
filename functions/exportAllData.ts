import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { zip } from 'npm:fflate@0.8.2';

const ENTITIES_TO_EXPORT = [
    'Task', 'JournalEntry', 'WellnessEntry', 'FamilyMember', 'FamilyEvent',
    'Memory', 'VisionBoard', 'VisionCard', 'HabitTracker', 'HabitCompletion',
    'MealPlan', 'SavedRecipe', 'ClothingItem', 'OutfitPlan', 'PlannerNote'
];

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const dataToZip = {};
        
        for (const entityName of ENTITIES_TO_EXPORT) {
            try {
                const records = await base44.entities[entityName].filter({ created_by: user.email });
                const jsonString = JSON.stringify(records, null, 2);
                const fileContent = new TextEncoder().encode(jsonString);
                dataToZip[`${entityName}.json`] = fileContent;
            } catch (e) {
                console.error(`Could not export entity ${entityName}:`, e.message);
                // Continue to next entity even if one fails
            }
        }

        const zipped = await new Promise((resolve, reject) => {
            zip(dataToZip, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        return new Response(zipped, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="dobrylife_export.zip"',
            },
        });

    } catch (error) {
        console.error('Export failed:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});