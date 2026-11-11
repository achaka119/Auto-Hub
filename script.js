$(function () {
    const $contactForm = $('#contact-form');
    if ($contactForm.length) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        const $password = $('#password');
        const $confirm = $('#confirm-password');
        const $strength = $('#password-strength');
        const $strengthBar = $('#strength-bar');
        const $match = $('#password-match');
        const $feedback = $('#form-feedback');

        function passwordScore(value) {
            let score = 0;
            if (value.length >= 8) score++;
            if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
            if (/\d/.test(value)) score++;
            if (/[^A-Za-z0-9]/.test(value)) score++;
            return score;
        }

        function updatePasswordFeedback() {
            const value = $password.val();
            const score = passwordScore(value);
            const levels = [
                { label: 'Weak password', width: '25%', className: 'weak' },
                { label: 'Weak password', width: '25%', className: 'weak' },
                { label: 'Medium password', width: '60%', className: 'medium' },
                { label: 'Strong password', width: '100%', className: 'strong' },
                { label: 'Strong password', width: '100%', className: 'strong' }
            ];
            const level = value.length ? levels[score] : { label: 'Use at least 8 characters.', width: '0%', className: '' };
            $strength.text(level.label).removeClass('text-danger text-warning text-success');
            if (level.className === 'weak') $strength.addClass('text-danger');
            if (level.className === 'medium') $strength.addClass('text-warning');
            if (level.className === 'strong') $strength.addClass('text-success');
            $strengthBar.css('width', level.width).attr('class', level.className);
            updatePasswordMatch();
        }

        function updatePasswordMatch() {
            if (!$confirm.val()) {
                $match.text('').removeClass('text-danger text-success');
                return;
            }
            const matches = $confirm.val() === $password.val();
            $match.text(matches ? 'Passwords match.' : 'Passwords do not match.')
                .toggleClass('text-success', matches)
                .toggleClass('text-danger', !matches);
        }

        $password.on('input', updatePasswordFeedback);
        $confirm.on('input', updatePasswordMatch);
        $('#email').on('input', function () {
            const value = $(this).val().trim();
            $(this).toggleClass('is-invalid', value.length > 0 && !emailPattern.test(value));
            $(this).toggleClass('is-valid', value.length > 0 && emailPattern.test(value));
        });

        $contactForm.on('submit', function (event) {
            event.preventDefault();
            $feedback.addClass('d-none').removeClass('alert-success alert-danger').text('');
            const email = $('#email').val().trim();
            const password = $password.val();
            const errors = [];

            if (!$('#full-name').val().trim()) errors.push('Enter your name.');
            if (!email || !emailPattern.test(email)) errors.push('Enter a valid email address.');
            if (!$('#request').val()) errors.push('Choose a request type.');
            if (!$('#message').val().trim() || $('#message').val().trim().length < 10) errors.push('Write a message with at least 10 characters.');
            if (password.length < 8) errors.push('Password must contain at least 8 characters.');
            if (password !== $confirm.val()) errors.push('Passwords must match.');
            if (!$('#demo-consent').is(':checked')) errors.push('Confirm that you understand this is a demo form.');

            if (errors.length) {
                $feedback.removeClass('d-none').addClass('alert-danger').text(errors.join(' '));
                $feedback[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                return;
            }
            $feedback.removeClass('d-none').addClass('alert-success')
                .text('Thank you, ' + $('#full-name').val().trim() + '! The demo form passed validation. No message was sent.');
            this.reset();
            $('#email').removeClass('is-valid is-invalid');
            updatePasswordFeedback();
        });
    }
  
    const $saleItems = $('.sale-card-item');
    if ($saleItems.length) {
        let activeCategory = 'all';
        function filterSaleCars() {
            const query = ($('#car-search').val() || '').trim().toLowerCase();
            let visibleCount = 0;
            $saleItems.each(function () {
                const $item = $(this);
                const matchesCategory = activeCategory === 'all' || $item.data('category') === activeCategory;
                const matchesText = $item.text().toLowerCase().includes(query);
                const visible = matchesCategory && matchesText;
                $item.toggle(visible);
                if (visible) visibleCount++;
            });
            $('#search-results').text(visibleCount + (visibleCount === 1 ? ' car found.' : ' cars found.'));
        }
        $('#car-search').on('input', filterSaleCars);
        $('.filter-button').on('click', function () {
            activeCategory = $(this).data('filter');
            $('.filter-button').removeClass('btn-primary is-active').addClass('btn-outline-primary').attr('aria-pressed', 'false');
            $(this).removeClass('btn-outline-primary').addClass('btn-primary is-active').attr('aria-pressed', 'true');
            filterSaleCars();
        });
        filterSaleCars();
    }

          function renderCars() {
            $inventoryRows.empty();
            cars.forEach(function (car) {
                const $row = $('<tr>');
                $('<th>', { scope: 'row' }).text(car.name).appendTo($row);
                $('<td>').text(car.category).appendTo($row);
                $('<td>').text(Number(car.price).toLocaleString('en-US') + ' ₸').appendTo($row);
                const $actions = $('<td>');
                $('<button>', { type: 'button', class: 'btn btn-sm btn-outline-primary me-2 edit-car', text: 'Edit' }).data('id', car.id).appendTo($actions);
                $('<button>', { type: 'button', class: 'btn btn-sm btn-outline-danger delete-car', text: 'Delete' }).data('id', car.id).appendTo($actions);
                $actions.appendTo($row);
                $inventoryRows.append($row);
            });
            localStorage.setItem(storageKey, JSON.stringify(cars));
        }

        function resetInventoryForm() {
            $('#inventory-form')[0].reset();
            $('#inventory-id').val('');
            $('#inventory-form-title').text('Add a car');
            $('#inventory-save').text('Add car');
            $('#inventory-cancel').addClass('d-none');
        }

        $('#inventory-form').on('submit', function (event) {
            event.preventDefault();
            const name = $('#inventory-name').val().trim();
            const category = $('#inventory-category').val();
            const price = Number($('#inventory-price').val());
            if (!name || !category || !Number.isFinite(price) || price < 1) {
                $('#inventory-feedback').text('Enter a name, choose a body type, and enter a price above zero.').addClass('text-danger');
                return;
            }
            const id = $('#inventory-id').val();
            if (id) {
                const car = cars.find(function (item) { return item.id === id; });
                if (car) Object.assign(car, { name: name, category: category, price: price });
                $('#inventory-feedback').text('Car updated.').removeClass('text-danger').addClass('text-success');
            } else {
                cars.push({ id: 'car-' + Date.now(), name: name, category: category, price: price });
                $('#inventory-feedback').text('Car added.').removeClass('text-danger').addClass('text-success');
            }
            renderCars();
            resetInventoryForm();
        });

        $inventoryRows.on('click', '.edit-car', function () {
            const car = cars.find(function (item) { return item.id === $(this).data('id'); }.bind(this));
            if (!car) return;
            $('#inventory-id').val(car.id);
            $('#inventory-name').val(car.name);
            $('#inventory-category').val(car.category);
            $('#inventory-price').val(car.price);
            $('#inventory-form-title').text('Edit car');
            $('#inventory-save').text('Save changes');
            $('#inventory-cancel').removeClass('d-none');
            $('#inventory-feedback').text('');
            $('#inventory-name').trigger('focus');
        });

        $inventoryRows.on('click', '.delete-car', function () {
            const id = $(this).data('id');
            const car = cars.find(function (item) { return item.id === id; });
            if (!car || !window.confirm('Delete ' + car.name + ' from the sample inventory?')) return;
            cars = cars.filter(function (item) { return item.id !== id; });
            renderCars();
            $('#inventory-feedback').text('Car deleted.').removeClass('text-danger').addClass('text-success');
            if ($('#inventory-id').val() === id) resetInventoryForm();
        });
        $('#inventory-cancel').on('click', resetInventoryForm);
        renderCars();
    }

  const galleryImages = [
        { src: 'assets/images/sedan.jpg', alt: 'White sedan parked beside mountains' },
        { src: 'assets/images/suv.jpg', alt: 'Black SUV on a road beside mountains' },
        { src: 'assets/images/city.jpg', alt: 'Black hatchback parked beside the sea' }
    ];
    const $lightbox = $('#lightbox');
    if ($lightbox.length) {
        let currentImage = 0;
        let $lastTrigger = null;
        function showGalleryImage(index) {
            currentImage = (index + galleryImages.length) % galleryImages.length;
            const image = galleryImages[currentImage];
            $('#lightbox-image').attr({ src: image.src, alt: image.alt });
            $('#lightbox-caption').text(image.alt);
        }
        function closeLightbox() {
            $lightbox.fadeOut(160, function () {
                $lightbox.attr('aria-hidden', 'true');
                if ($lastTrigger) $lastTrigger.trigger('focus');
            });
            $('body').removeClass('lightbox-open');
        }
        $('.gallery-item').on('click', function () {
            $lastTrigger = $(this);
            showGalleryImage(Number($(this).data('gallery-index')));
            $lightbox.attr('aria-hidden', 'false').fadeIn(180);
            $('body').addClass('lightbox-open');
            $('.lightbox-close').trigger('focus');
        });
        $('.lightbox-close').on('click', closeLightbox);
        $('.lightbox-prev').on('click', function () { showGalleryImage(currentImage - 1); });
        $('.lightbox-next').on('click', function () { showGalleryImage(currentImage + 1); });
        $lightbox.on('click', function (event) { if (event.target === this) closeLightbox(); });
        $(document).on('keydown', function (event) {
            if ($lightbox.attr('aria-hidden') === 'true') return;
            if (event.key === 'Escape') closeLightbox();
            if (event.key === 'ArrowLeft') showGalleryImage(currentImage - 1);
            if (event.key === 'ArrowRight') showGalleryImage(currentImage + 1);
        });
    }
});
