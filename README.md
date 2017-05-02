multi.js
=======

multi.js is a user-friendly replacement for select boxes with the multiple attribute. It has no dependencies, is mobile-friendly, and provides search functionality. multi.js is also easy to style with CSS and optionally supports jQuery.

Check out the [demo](http://fabianlindfors.se/multijs/).

![Preview of multi.js](http://fabianlindfors.se/multijs/images/preview.png)

Installation
-----
Clone or download the repository to your project and include both files in the dist directory.

```html
<link rel="stylesheet" type="text/css" href="multijs/dist/multi.min.css">
<script src="multijs/dist/multi.min.js"></script>
```

Usage
-----
multi.js can be applied to any select element with the multiple attribute enabled.

```javascript
var select_element = document.getElementById( 'your_select_element' );
multi( select_element );
```


To customize multi a few options can be passed with the function call. Below are all the default values.

```javascript
multi( select_element, {
    'enable_search': true,
    'search_placeholder': 'Search...',
});
```

### AJAX options

multi.js can automatically fetch options using AJAX calls and add the fetched items to the option list

```javascript
multi( select_element, {
    ajax: {
        // Fetch the elements from this endpoint
        endpoint: 'https://yourendpoint.api',
        // This function if present, will be executed with the data returned
        // from the endpoint before its inserted into the select.
        transform: function ( endpoint_data ) {
            //
            // If the endpoint_data is an object following this structure:
            //
            // {
            //     status: 'OK',
            //     data: [
            //         {
            //             id: 0,
            //             full_name: 'string',
            //             is_enrolled: true,
            //             location: { ... },
            //             ...
            //         },
            //         ...
            //     ]
            // }
            //
            // We could transform this object into a SelectOption like
            //
            return endpoint_data
                .data
                // Filter the options
                .filter( function ( option ) {
                    return option.id < 10;
                } )
                // Build the SelectOption like object
                // multi.js will build the options using the returned object
                .map( function ( option ) {
                    return {
                        label: option.full_name,
                        value: option.id,
                        selected: option.is_enrolled
                    };
                } );
        },
        // Decide if the fetched options will be appended to the current option
        // list or otherwise replace the defined options with the AJAX ones
        append: true
    }
} );
```

Find a working demonstration on [the examples folder](examples/ajax.html).

#### API

Find below a definition of all the options supported by the AJAX options feature

```typescript
/**
 *
 * @param {AjaxOptions} settings.ajax Options to handle the automatic
 *      fetch of options.
 *
 * @param {string} endpoint Url where the options will be fetched from
 * @param {TransformFunction} transform Intermediate function that allows
 *      the user to transform the data returned by the endpoint. This
 *      function should return an array of objects compatible with the
 *      SelectOption interface.
 * @param {boolean} append Wether the options will replace the current
 *      option set or augment it.
 *
 */

interface AjaxOptions {
    endpoint: string;
    transform?: TransformFunction;
    append?: boolean;
}


/**
 *
 * @param {any} data Data returned by the endpoint
 *
 * @return {SelectOption[]} List of options that should match the
 *      structure of a SelectOption
 *
 */

declare function TransformFunction ( data: any ): SelectOption[]


/**
 *
 * @param {string} value Value mapped to the value attribute
 * @param {string} label Value mapped to the innerText property
 * @param {boolean} selected Wether the option is selected by default or not
 * @param {boolean} disabled Wether the option is disabled by default or not
 *
 */
interface SelectOption {
    value?: String;
    label: String;
    selected?: boolean;
    disabled?: boolean;
}
```

multi.js is fully native Javascript but also has jQuery support. If you have jQuery included multi can be applied to a select element as follows:

```javascript
$( '#your_select_element' ).multi();
```

TODO
-----
* ~~Native Javascript, no jQuery~~
* ~~Support for disabled options~~
* Browser testing
* Support for optgroups
* ~~Support for retrieving options by AJAX~~
* Tests

Contributing
-----
All contributions, big and small, are very welcome.

Try to mimic the general programming style (mostly based on personal preferences) and keep any CSS as simple as possible. Build the project with Grunt and bump the version number before creating a pull request.

License
-----
multi.js is licensed under [MIT](https://github.com/Fabianlindfors/multi.js/blob/master/LICENSE).
