class APIFeatures {
    contructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    };

    filter() {
        // 1A) FILTERING
        const queryObj = { ...this.queryString };
        const excludedField = ['page', 'sort', 'limit', 'fields'];
        excludedField.forEach(el => delete queryObj[el]);

        // 1B) ADVANCED FILTERING
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    };

    sort() {
        // 2) SORTING
        if (this.queryString.sort) {
            // console.log(this.queryString.sort);
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    };

    limitFields() {
        // 3) FIELD LIMITING
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            // excludes property '__v' from query
            this.query = this.query.select('-__v');
        }
        return this;
    };

    paginate() {
        // 4) PAGINATION 
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        // skip first 'skip #' records, and limit the return result to 'limit #'
        this.query = this.query.skip(skip).limit(limit);
        return this;
    };
};


module.exports = APIFeatures;