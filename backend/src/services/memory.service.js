const CustomerMemory =
require("../models/CustomerMemory");

/**
 * Long Term AI Memory Service
 */

const saveMemory = async ({
    phoneNumber,
    customerName,
    summary,
    interest,
    intent,
    sentiment
}) => {

    try {

        await CustomerMemory.findOneAndUpdate(

            {
                phoneNumber
            },

            {
                customerName,
                summary,
                interest,

                lastIntent: intent,

                lastSentiment:
                    sentiment,

                $inc: {
                    totalCalls: 1
                }
            },

            {
                upsert: true,
                new: true
            }
        );

    } catch (error) {

        console.error(
            "Memory Save Error:",
            error.message
        );
    }
};

const getMemory = async (
    phoneNumber
) => {

    try {

        return await CustomerMemory
            .findOne({
                phoneNumber
            });

    } catch (error) {

        console.error(
            "Memory Fetch Error:",
            error.message
        );

        return null;
    }
};

module.exports = {
    saveMemory,
    getMemory
};