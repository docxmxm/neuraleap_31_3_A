/**
 * Utility functions for checking and updating the Supabase database schema
 * This helps ensure that the application and database schema are in sync
 */

/**
 * Checks if a column exists in a table
 * @param {Object} supabase - The Supabase client
 * @param {string} table - The table to check
 * @param {string} column - The column to check for
 * @returns {Promise<boolean>} - Returns true if the column exists
 */
async function columnExists(supabase, table, column) {
    try {
        // Fetch one row to check the structure
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
        
        if (error) throw error;
        
        // If there's no data, we can't check the structure
        if (!data || data.length === 0) {
            console.warn(`No data in ${table} table to check structure`);
            return false;
        }
        
        // Check if the column exists in the first row
        return column in data[0];
    } catch (error) {
        console.error(`Error checking if column ${column} exists in ${table}:`, error);
        return false;
    }
}

/**
 * Gets the current schema of a table
 * @param {Object} supabase - The Supabase client
 * @param {string} table - The table to get the schema for
 * @returns {Promise<Object>} - Returns an object with column names as keys
 */
async function getTableSchema(supabase, table) {
    try {
        // Fetch one row to get the structure
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
        
        if (error) throw error;
        
        // If there's no data, we can't get the structure
        if (!data || data.length === 0) {
            console.warn(`No data in ${table} table to get schema`);
            return {};
        }
        
        // Return the keys from the first row as the schema
        return Object.keys(data[0]).reduce((schema, column) => {
            schema[column] = typeof data[0][column];
            return schema;
        }, {});
    } catch (error) {
        console.error(`Error getting schema for ${table}:`, error);
        return {};
    }
}

/**
 * Verifies the required columns for the profiles table
 * @param {Object} supabase - The Supabase client
 * @returns {Promise<Object>} - Returns an object with the missing columns
 */
async function verifyProfilesSchema(supabase) {
    const requiredColumns = {
        'id': 'UUID',
        'username': 'TEXT',
        'email': 'TEXT',
        'first_name': 'TEXT',
        'last_name': 'TEXT',
        'created_at': 'TIMESTAMP WITH TIME ZONE',
        'updated_at': 'TIMESTAMP WITH TIME ZONE',
        'bio': 'TEXT',
        'title': 'TEXT',
        'company': 'TEXT',
        'phone': 'TEXT',
        'location': 'TEXT',
        'interests': 'JSONB',
        'languages': 'JSONB',
        'education_level': 'TEXT',
        'education_field': 'TEXT',
        'university': 'TEXT'
    };
    
    const missingColumns = {};
    
    for (const column in requiredColumns) {
        const exists = await columnExists(supabase, 'profiles', column);
        if (!exists) {
            missingColumns[column] = requiredColumns[column];
        }
    }
    
    return missingColumns;
}

/**
 * Generates SQL statements to add missing columns
 * @param {Object} missingColumns - Object with missing column names and types
 * @returns {string} - SQL statements to add the missing columns
 */
function generateAlterTableSQL(missingColumns) {
    if (Object.keys(missingColumns).length === 0) {
        return '';
    }
    
    let sql = 'ALTER TABLE profiles\n';
    
    Object.entries(missingColumns).forEach(([column, type], index) => {
        sql += `ADD COLUMN IF NOT EXISTS ${column} ${type}`;
        
        // Add default value for text fields
        if (type === 'TEXT') {
            sql += ` DEFAULT ''`;
        } else if (type.includes('TIMESTAMP')) {
            sql += ` DEFAULT NOW()`;
        } else if (type === 'JSONB') {
            sql += ` DEFAULT '[]'`;
        }
        
        // Add comma if not the last column
        if (index < Object.keys(missingColumns).length - 1) {
            sql += ',\n';
        } else {
            sql += ';';
        }
    });
    
    return sql;
}

// Export the functions
if (typeof window !== 'undefined') {
    window.SupabaseSchemaUtils = {
        columnExists,
        getTableSchema,
        verifyProfilesSchema,
        generateAlterTableSQL
    };
} 