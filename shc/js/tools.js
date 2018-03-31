var tools = {
    shortenNumber: (num, digits) => {
        var units = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
            decimal;

        for(var i=units.length-1; i>=0; i--) {
            decimal = Math.pow(1000, i+1);

            if(num <= -decimal || num >= decimal) {
                return +(num / decimal).toFixed(digits) + units[i];
            }
        }
        return num;
    },
    vestToSp: (vest) => {
        return vest.split()[0].split('.')[0] / 2054.45;
    }
};