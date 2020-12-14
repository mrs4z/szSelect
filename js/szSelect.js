class szSelect {
    constructor(options) {
        // get dom
        this.$selector = options.selector
        this.objects = []

        // init
        this.$selector.hide()
        this.parseObject()
        this.createHtml()
    }

    parseObject() {
        let _self = this
        $.each(this.$selector.find('option'), function(index, item) {
            let getStatus = $(item).is(':selected') ? 1 : 0

            // app
            _self.objects.push({
                id: $(item).attr('value'),
                name: $(item).html(),
                status: getStatus
            })
        })
    }

    getSelectedItem() {
        return this.objects.find(item => item.status == 1)
    }

    getItemById(id) {
        return this.objects.find(item => item.id == id)
    }

    getItemByStatus() {
        let resultItem = null

        // result
        resultItem = this.objects.find(item => item.status == 1)

        // result item
        if(resultItem == 'undefined')
            return null
        else
            return resultItem
    }

    createHtml() {
        let resultSearch = ``, resultItems = ``, _self = this, stateOpen = false, activeList = 0

        console.log(this.$selector.attr('data-select-find'))

        // check item
        let getMaxCount = this.$selector.attr('data-select-find') != 'undefined' ? parseInt(this.$selector.attr('data-select-find')) : 3

        if(this.objects.length > getMaxCount) {
            resultSearch = `<div class="selector__modal-content">
                                    <div class="selector__modal-content-search">
                                        <div><input type="text" class="selector__modal-content-search-input" selector-event="search" placeholder="Поиск по ключевым словам"></div>
                                    </div>
                                </div>`
        }

        $.each(this.objects, function(index, item) {
            // get active
            let getActive = item.status == 1 ? `<i class="fad fa-check-circle"></i>` : ''

            // result
            resultItems += `<div selector-event="select" selector-event-id="${item.id}" class="selector__modal-item ${item.status == 1 ? 'active' : ''}">
                                    <div class="selector__modal-item-title">${item.name}</div>
                                    <div class="selector__modal-item-active">${getActive}</div>
                                </div>`
        })

        if(this.getSelectedItem() == undefined)
            return false

        // create final html
        let createHTML = $(`<div class="selector active">
                <div class="selector__main">
                    <div class="selector__main-title">${this.getSelectedItem().name}</div>
                    <div class="selector__main-arrow"><i class="fas fa-sort-down"></i></div>
                </div>
                <div class="selector__modal" style="display: none;">
                    <div>${resultSearch}</div>
                    <div class="selector__modal-items" selector-event="body">
                        ${resultItems}
                    </div>
                </div>
            </div>`)

        // app
        this.$selector.before(createHTML)

        $(document).click(function(e) {
            if(!createHTML.is(e.target)
                && createHTML.has(e.target).length === 0) {
                createHTML.find('.selector__modal').slideUp(150, "linear", function() { })
                createHTML.find('.selector__main-arrow').removeClass('flip')
            }
        })

        createHTML.find('.selector__main').click(function() {
            createHTML.find('.selector__modal').slideToggle(150, "linear", function() { })
            createHTML.find('.selector__main-arrow').toggleClass('flip')

            // state
            stateOpen = !stateOpen ? true : false

            if(stateOpen) {
                activeList = 0
                $(document).keydown(function(e) {
                    // event
                    _self.setEventSelectorArrow(e, createHTML, activeList, {
                        setActive: function(i) {
                            activeList = i
                        },
                        selectItem: function(itemId) {
                            let getActiveItem = createHTML.find(`[selector-event-id="${itemId}"]`)
                            if(getActiveItem.length > 0) {
                                // add active item
                                _self.setActiveItem(createHTML, getActiveItem)
                            }
                        }
                    })
                })
            } else {
                $(document).unbind('keydown')
                activeList = 0
            }
        })

        // input event
        _self.findByEvent(createHTML, {
            setActive: function(i) {
                activeList = i
            }
        })

        // select
        _self.setEventSelector(createHTML)
    }

    setEventSelectorArrow(e, dom, list, call) {
        // get length
        let getListOfSelector = dom.find('[selector-event="select"]').length + 1

        // esc
        if(e.keyCode == 27) {
            // init click
            dom.find('.selector__main').click()

            // res
            return false
        }

        // enter
        if(e.keyCode == 13) {
            // active
            let getActive = dom.find(`[selector-event="select"].selected`).attr('selector-event-id')

            // set call
            call.selectItem(getActive)

            return false
        }

        // up
        if(e.keyCode == 38) {
            e.preventDefault()

            if(list - 1 <= 0)
                return false

            // remove class selected
            dom.find(`[selector-event="select"].selected`).removeClass('selected')

            // list
            dom.find(`[selector-event="select"]`).eq(list - 2).addClass('selected')

            // list add
            list--

            // update active list
            call.setActive(list)

            return false
        } else if(e.keyCode == 40) {
            e.preventDefault()

            if(getListOfSelector == list + 1)
                return false

            // remove class selected
            dom.find(`[selector-event="select"].selected`).removeClass('selected')

            // list
            dom.find(`[selector-event="select"]`).eq(list).addClass('selected')

            // list add
            list++

            // update active list
            call.setActive(list)

            return false
        }


    }

    setEventSelector(createHTML) {
        let _self = this
        // unbin and reset
        createHTML.find('[selector-event="select"]').unbind('click')
        createHTML.find('[selector-event="select"]').unbind('hover')
        createHTML.find('[selector-event="select"]').click(function(e) {
            // add active item
            _self.setActiveItem(createHTML, $(this))
        })

        createHTML.find('[selector-event="select"]').hover(function() {
            createHTML.find(`[selector-event="select"].selected`).removeClass('selected')
        })
    }

    findByEvent(dom, call) {
        let _self = this
        // on event
        dom.find('[selector-event="search"]').on('input', function(e) {
            call.setActive(0)
            // select
            let getValue = $(this).val().toLowerCase()

            // update search
            _self.updateSearchItem(dom, getValue)
        })

    }

    setActiveItem(createHTML, button) {
        let _self = this
        let getActiveItem = _self.getItemByStatus()

        // result
        if(getActiveItem != null) {
            // update status
            getActiveItem.status = 0

            // html
            createHTML.find(`[selector-event-id="${getActiveItem.id}"]`).find('.selector__modal-item-active').html('')
            createHTML.find(`[selector-event-id="${getActiveItem.id}"]`).removeClass('active')
        }

        // change
        button.addClass('active')
        button.find('.selector__modal-item-active').html('<i class="fad fa-check-circle"></i>')

        // status
        let getNewId = _self.getItemById(button.attr('selector-event-id'))
        // update status
        getNewId.status = 1

        // change main status
        createHTML.find('.selector__main').find('.selector__main-title').html(getNewId.name)

        // init click
        createHTML.find('.selector__main').click()

        // update
        _self.updateSearchItem(createHTML, '')
        createHTML.find('[selector-event="search"]').val('')

        // set value
        _self.$selector.val(getNewId.id)

        // on change event
        _self.$selector.change()
    }

    updateSearchItem(dom, val) {
        let _self = this, createHtml = ``
        // for let item
        for(let i = 0; i < _self.objects.length; i++) {
            if(_self.objects[i].name.toLowerCase().indexOf(val) >= 0) {
                let item = _self.objects[i], getActive = item.status == 1 ? `<i class="fad fa-check-circle"></i>` : ''
                createHtml += `
                            <div selector-event="select" selector-event-id="${item.id}" class="selector__modal-item ${item.status == 1 ? 'active' : ''}">
                                <div class="selector__modal-item-title">${item.name}</div>
                                <div class="selector__modal-item-active">${getActive}</div>
                            </div>
                        `
            }
        }

        // update body
        dom.find('[selector-event="body"]').html(createHtml)

        // set click
        _self.setEventSelector(dom)
    }
}