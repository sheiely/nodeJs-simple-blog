const mongoose = require('mongoose');
//Creating model
    const Schema = mongoose.Schema;
    const Category = Schema({
        name: {
            type: String,
            required: true 
        },
        slug: {
            type: String,
            required: true 
        },
        date: {
            type: Date,
            default: Date.now()
        }
    });

    mongoose.model("categories", Category);