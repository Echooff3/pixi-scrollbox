'use strict';

module.exports = function (options, defaults) {
    options = options || {};
    for (var item in defaults) {
        if (typeof options[item] === 'undefined') {
            options[item] = defaults[item];
        }
    }
    return options;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWZhdWx0cy5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwib3B0aW9ucyIsImRlZmF1bHRzIiwiaXRlbSJdLCJtYXBwaW5ncyI6Ijs7QUFBQUEsT0FBT0MsT0FBUCxHQUFpQixVQUFVQyxPQUFWLEVBQW1CQyxRQUFuQixFQUNqQjtBQUNJRCxjQUFVQSxXQUFXLEVBQXJCO0FBQ0EsU0FBSyxJQUFJRSxJQUFULElBQWlCRCxRQUFqQixFQUNBO0FBQ0ksWUFBSSxPQUFPRCxRQUFRRSxJQUFSLENBQVAsS0FBeUIsV0FBN0IsRUFDQTtBQUNJRixvQkFBUUUsSUFBUixJQUFnQkQsU0FBU0MsSUFBVCxDQUFoQjtBQUNIO0FBQ0o7QUFDRCxXQUFPRixPQUFQO0FBQ0gsQ0FYRCIsImZpbGUiOiJkZWZhdWx0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdGlvbnMsIGRlZmF1bHRzKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgZm9yIChsZXQgaXRlbSBpbiBkZWZhdWx0cylcbiAgICB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9uc1tpdGVtXSA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgIHtcbiAgICAgICAgICAgIG9wdGlvbnNbaXRlbV0gPSBkZWZhdWx0c1tpdGVtXVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvcHRpb25zXG59Il19