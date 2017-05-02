/**
 * multi.js
 * A user-friendly replacement for select boxes with multiple attribute enabled.
 *
 * Author: Fabian Lindfors
 * License: MIT
 */
var multi = (function() {

    // Helper function to trigger an event on an element
    var trigger_event = function( type, el ) {
        var e = document.createEvent( 'HTMLEvents' );
        e.initEvent( type, false, true );
        el.dispatchEvent( e );
    };

    // Toggles the target option on the select
    var toggle_option = function ( select, event ) {
        var option = select.options[ event.target.getAttribute( 'multi-index' ) ];

        if ( option.disabled ) {
          return;
        }

        option.selected = !option.selected;
        trigger_event( 'change', select );
    };


    /**
     *
     * Sets the options of the select based on an array of options.
     *
     * The options parameter must be an array with all its elements implementing
     * the following interface:
     *
     * @param {string} value Value mapped to the value attribute
     * @param {string} label Value mapped to the innerText property
     * @param {boolean} selected Wether the option is selected by default or not
     * @param {boolean} disabled Wether the option is disabled by default or not
     *
     * interface SelectOption {
     *      value?: String;
     *      label: String;
     *      selected?: boolean;
     *      disabled?: boolean;
     * }
     *
     * @param {HTMLSelectElement} $select Select element to set options.
     * @param {SelectOption[]} options List of Options to be added to the select
     * @param {boolean} append Wether the options will replace the current
     *      option set or augment it
     */
    var set_options = function ( $select, options, append ) {

        if ( !append ) {
            $select.innerHTML = '';
        }

        options
            .map( function ( option ) {

                var $option = document.createElement( 'option' );

                $option.value = option.value;
                $option.innerText = option.label;

                $option.disabled = !!option.disabled;
                $option.selected = !!option.selected;

                return $option;

            } )
            .forEach( function ( $option ) {
                $select.appendChild( $option );
            } );

        return select;

    };


    // Refreshes an already constructed multi.js instance
    var refresh_select = function( select, settings ) {

        // Clear columns
        select.wrapper.selected.innerHTML = '';
        select.wrapper.non_selected.innerHTML = '';

        // Get search value
        if ( select.wrapper.search ) {
            var query = select.wrapper.search.value;
        }

        // Loop over select options and add to the non-selected and selected columns
        for ( var i = 0; i < select.options.length; i++ ) {

            var option = select.options[i];

            var value = option.value;
            var label = option.textContent || option.innerText;

            var row = document.createElement( 'a' );
            row.tabIndex = 0;
            row.className = 'item';
            row.innerHTML = label;
            row.setAttribute( 'role', 'button' );
            row.setAttribute( 'data-value', value );
            row.setAttribute( 'multi-index', i );

            if ( option.disabled ) {
              row.className += ' disabled';
            }

            // Add row to selected column if option selected
            if ( option.selected ) {

                row.className += ' selected';
                var clone = row.cloneNode( true );
                select.wrapper.selected.appendChild( clone );

            }

            // Apply search filtering
            if ( !query || query && label.toLowerCase().indexOf( query.toLowerCase() ) > -1 ) {
                select.wrapper.non_selected.appendChild( row );
            }

        }

    };


    var setup = function ( select, settings ) {

        // Hide select
        select.style.display = 'none';
        select.setAttribute( 'data-multijs', true );

        // Start constructing selector
        var wrapper = document.createElement( 'div' );
        wrapper.className = 'multi-wrapper';


        // Add search bar
        if ( settings.enable_search ) {
            var search = document.createElement( 'input' );
            search.className = 'search-input';
            search.type = 'text';
            search.setAttribute( 'placeholder', settings.search_placeholder );

            search.addEventListener( 'input', function() {
                refresh_select( select, settings );
            });

            wrapper.appendChild( search );
            wrapper.search = search;
        }


        // Add columns for selected and non-selected
        var non_selected = document.createElement( 'div' );
        non_selected.className = 'non-selected-wrapper';

        var selected = document.createElement( 'div' );
        selected.className = 'selected-wrapper';


        // Add click handler to toggle the selected status
        wrapper.addEventListener( 'click', function ( event ) {

            if ( event.target.getAttribute( 'multi-index' ) ) {
                toggle_option( select, event );
            }

        });


        // Add keyboard handler to toggle the selected status
        wrapper.addEventListener( 'keypress', function ( event ) {

            var is_action_key = event.keyCode === 32 || event.keyCode === 13;
            var is_option = event.target.getAttribute( 'multi-index' );

            if ( is_option && is_action_key ) {

                // Prevent the default action to stop scrolling when space is pressed
                event.preventDefault();
                toggle_option( select, event );

            }

        });


        wrapper.appendChild( non_selected );
        wrapper.appendChild( selected );

        wrapper.non_selected = non_selected;
        wrapper.selected = selected;

        select.wrapper = wrapper;

        // Add multi.js wrapper after select element
        select.parentNode.insertBefore( wrapper, select.nextSibling );


        // Initialize selector with values from select element
        refresh_select( select, settings );

        // Refresh selector when select values change
        select.addEventListener( 'change', function() {
            refresh_select( select, settings );
        });
    };


    // Intializes and constructs an multi.js instance
    var init = function( select, settings ) {


        // Check if already initalized
        if ( select.dataset.multijs != null ) {
            return;
        }

        // Make sure element is select and multiple is enabled
        if ( select.nodeName != 'SELECT' || ! select.multiple ) {
            return;
        }


        /**
         * Set up settings (optional parameter) and its default values
         *
         * Default values:
         * enable_search : true
         * search_placeholder : 'Search...'
         */
        settings = typeof settings !== 'undefined' ? settings : {};

        settings['enable_search'] = typeof settings['enable_search'] !== 'undefined' ? settings['enable_search'] : true;
        settings['search_placeholder'] = typeof settings['search_placeholder'] !== 'undefined' ? settings['search_placeholder'] : 'Search...';


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
         * interface AjaxOptions {
         *      endpoint: string;
         *      transform?: TransformFunction;
         *      append?: boolean;
         * }
         *
         * @param {any} data Data returned by the endpoint
         *
         * @return {SelectOption[]} List of options that should match the
         *      structure of a SelectOption
         *
         * declare function TransformFunction ( data: any ): SelectOption[]
         *
         */
        if ( typeof settings.ajax === 'object' &&
             typeof settings.ajax.endpoint === 'string' ) {

            fetch( settings.ajax.endpoint )
                // Transform the response to JSON
                .then( function ( response ) {
                    return response.json();
                } )
                // Apply the transform function if provided
                .then( function ( data ) {
                    return ( typeof settings.ajax.transform === 'function' ) ?
                        settings.ajax.transform( data ):
                        data;
                } )
                // Append the fetched options to the select and initialize the
                // component
                .then( function ( options ) {
                    select = set_options( select, options, !!settings.ajax.append );
                    setup( select, settings );
                } )
                .catch( function ( error ) {
                    throw error;
                } );

        } else {
            setup( select, settings );
        }


    };


    return init;

}());


// Add jQuery wrapper if jQuery is present
if ( typeof jQuery !== 'undefined' ) {
    (function($) {

        $.fn.multi = function( settings ) {

            settings = typeof settings !== 'undefined' ? settings : {};

            return this.each( function() {

                var $select = $(this);

                multi( $select.get(0), settings );

            });

        }

    })(jQuery);
}
