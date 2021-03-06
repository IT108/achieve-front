import {Component, OnInit, OnChanges, AfterViewInit, SimpleChanges, ElementRef} from '@angular/core';
import {FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder} from '@angular/forms';
import {selector} from 'rxjs-compat/operator/publish';
import {RegisterwizardService} from './registerwizard.service';
import {SignalRService} from '../../services/signal-r.service';
import {AdConnectModel} from '../../models/ad-connect-model';
import {log} from 'util';
import {Observable} from 'rxjs';
import {type} from 'os';
import {finalize} from 'rxjs/operators';
import {AuthService} from '../../shared/authentication/auth.service';
import {RegisterModel} from '../../models/register-model';
import {Router} from '@angular/router';
import {AdUserModel} from '../../models/ad-user-model';
// import * as $ from 'jquery';

declare var swal: any;
declare var $: any;

const successMsg = 'Успешно!';
const errorMsg = 'Ошибка!';


interface FileReaderEventTarget extends EventTarget {
    result: string
}

interface FileReaderEvent extends Event {
    target: FileReaderEventTarget;

    getMessage(): string;
}


@Component({
    moduleId: module.id,
    // tslint:disable-next-line:component-selector
    selector: 'wizard-cmp',
    templateUrl: 'registerwizard.component.html'
})

export class RegisterwizardComponent implements OnInit, AfterViewInit, OnChanges {
    formDomainName;
    formName;
    formSurname;
    formEmail;
    formPassword;
    formDomainLogin;
    formDomainPass;
    formInterests;
    domainSelected;
    domainLogo = 'default';
    domainLine1;
    domainLine2;
    connectionStatus = '';
    adUser: AdUserModel;
    possibleDomains;
    isAnswered = false;
    isConnectionSuccessful = false;
    focus;
    focus1;
    focus2;
    focus22;
    focus3;
    focus4;
    userGroups;
    connecting = false;
    private toggleButton;
    private sidebarVisible: boolean;
    private nativeElement: Node;
    test: Date = new Date();


    constructor(private element: ElementRef,
                private registerwizardService: RegisterwizardService,
                private signalRService: SignalRService,
                private authService: AuthService,
                private router: Router) {
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
        this.possibleDomains = registerwizardService.getPossibleDomains();
    }

    selectDomain(value: string) {
        console.log(value);
        this.domainSelected = true;
        this.domainLogo = 'ort';
        this.connecting = true;
    }

    keydown(event) {
        console.log(event);
    }

    readURL(input) {
        if (input.files && input.files[0]) {
            var reader: any = new FileReader();

            reader.onload = (e: FileReaderEvent) => {
                $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    onConnected(data: AdConnectModel) {
        console.log(data);
        this.isAnswered = true;
        this.isConnectionSuccessful = data.isSuccess;
        if (data.isSuccess) {
            this.domainLine1 = 'подключено к домену' + data.domain;
            this.domainLine2 = data.result.principalName;
            this.connectionStatus = successMsg;
            this.userGroups = data.result.groups;
            this.adUser = data.result;
        } else {
            this.domainLine1 = 'ошибка при подключении';
            this.domainLine2 = data.error;
            this.connectionStatus = errorMsg;
        }
    }

    onConnect(domain: string, login: string, password: string) {
        var conn: AdConnectModel = new AdConnectModel();
        conn.domain = domain;
        conn.password = password;
        conn.username = login;
        this.signalRService.domainSubscriber.subscribe((data: AdConnectModel) => {
            this.onConnected(data);
        });
        this.signalRService.connect(conn);
    }

    onFinishWizard() {
        var color = 'primary;'

        $.notify({
            icon: 'now-ui-icons ui-1_bell-53',
            message: 'Регистрируем вас.'

        }, {
            type: type[color],
            timer: 4000,
            placement: {
                from: 'bottom',
                align: 'right'
            }
        });

        var interests: string[];
        interests = [];
        document.getElementsByName('interests').forEach(value => {
            var val = <HTMLInputElement>value;
            if (val.checked) {
                interests.push(val.value);
            }
        })

        var userRegistration = new RegisterModel();
        userRegistration.Domain = this.formDomainName;
        userRegistration.DomainUsername = this.formDomainLogin;
        userRegistration.Email = this.formEmail;
        userRegistration.Name = this.formName;
        userRegistration.Surname = this.formSurname;
        userRegistration.Password = this.formPassword;
        userRegistration.Groups = this.userGroups;
        userRegistration.Interests = interests;

        userRegistration.ADUser = this.adUser;

        console.log(userRegistration);

        this.authService.register(userRegistration)
            .pipe(finalize(() => {
                console.log('fin')
            }))
            .subscribe(
                result => {
                    if (result) {
                        console.log('success')
                        $.notify({
                            icon: 'now-ui-icons ui-1_bell-53',
                            message: 'Вы успешно зарегистрировались.'

                        }, {
                            type: type['green;'],
                            timer: 4000,
                            placement: {
                                from: 'bottom',
                                align: 'right'
                            }
                        });
                    }
                    this.router.navigate(['/login']);
                },
                error => {
                    console.log('error' + error)
                    $.notify({
                        icon: 'now-ui-icons ui-1_bell-53',
                        message: 'Ошибка регистрации.'

                    }, {
                        type: type['red;'],
                        timer: 4000,
                        placement: {
                            from: 'bottom',
                            align: 'right'
                        }
                    });
                });
    }

    sidebarToggle() {
        var toggleButton = this.toggleButton;
        var body = document.getElementsByTagName('body')[0];
        var sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible === false) {
            setTimeout(function () {
                toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }

    checkFullPageBackgroundImage() {
        var $page = $('.full-page');
        var image_src = $page.data('image');
        var body = document.getElementsByTagName('body')[0];
        body.classList.add('register-page');
        if (image_src !== undefined) {
            var image_container = '<div class="full-page-background" style="background-image: url(' + image_src + ') "/>';
            $page.append(image_container);
        }
    };


    ngOnInit() {
        this.checkFullPageBackgroundImage();
        this.domainSelected = false;
        setTimeout(function () {
            // after 1000 ms we add the class animated to the login/register card
            $('.card').removeClass('card-hidden');
        }, 700);

        setTimeout(function () {
            $('.card.card-wizard').addClass('active');
        }, 600);
        if ($('.selectpicker').length !== 0) {
            $('.selectpicker').selectpicker({
                iconBase: 'nc-icon',
                tickIcon: 'nc-check-2'
            });
        }

        // Code for the Validator
        $.validator.addMethod(
            'loginRegex',
            function (value, element) {
                return new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,40})").test(value);
            },
        )
        const $validator = $('.card-wizard form').validate({


            rules: {
                firstname: {
                    required: true,
                    minlength: 3
                },
                lastname: {
                    required: true,
                    minlength: 3
                },
                email: {
                    required: true,
                    minlength: 3,
                },
                password: {
                    required: true,
                    minlength: 8,
                    loginRegex: true,
                },
                domainlogin: {
                    required: true,
                    minlength: 2,
                },
                domainpassword: {
                    required: true,
                    minlength: 5,
                },
                interests: {
                    required: true,
                }
            },
            messages: {
                'password': {
                    required: 'Вы должны ввести пароль',
                    rangelength: 'Пароль должен быть больше восьми символов',
                    loginRegex: 'В пароле должна быть как минимум одна большая латинская буква, одна маленькая и один символ'
                }
            },

            highlight: function (element) {
                $(element).closest('.input-group').addClass('has-danger');
            },
            unhighlight: function (element) {
                $(element).closest('.input-group').removeClass('has-danger');
            },
            errorElement: 'span',
            errorClass: 'error-message',
            errorPlacement: function (error, element) {
                if (element.parent('.input-group').length) {
                    error.insertAfter(element.parent());
                } else {
                    error.insertAfter(element);
                }
            }
        });
        // Wizard Initialization
        $('.card-wizard').bootstrapWizard({
            'tabClass': 'nav nav-pills',
            'nextSelector': '.btn-next',
            'previousSelector': '.btn-previous',

            onNext: function (tab, navigation, index) {
                var $valid = $('.card-wizard form').valid();
                var status = document.getElementById('connStatus').innerText;
                if (!$valid) {
                    $validator.focusInvalid();
                    return false;
                }
                if (index == 2 && status != successMsg) {
                    var color = 'primary;'

                    $.notify({
                        icon: 'now-ui-icons ui-1_bell-53',
                        message: 'Вам <b>обязательно</b> нужно подключиться к домену.'

                    }, {
                        type: type[color],
                        timer: 4000,
                        placement: {
                            from: 'bottom',
                            align: 'right'
                        }
                    });
                    return false;
                }
            },
            tryConnect: function () {
                var $valid = $('.card-wizard form').valid();
                if (!$valid) {
                    $validator.focusInvalid();
                    return false;
                }
                return true;
            },


            onInit: function (tab: any, navigation: any, index: any) {

                // check number of tabs and fill the entire row
                let $total = navigation.find('li').length;
                let $wizard = navigation.closest('.card-wizard');

                let $first_li = navigation.find('li:first-child a').html();
                let $moving_div = $('<div class="moving-tab">' + $first_li + '</div>');
                $('.card-wizard .wizard-navigation').append($moving_div);

                $total = $wizard.find('.nav li').length;
                let $li_width = 100 / $total;

                let total_steps = $wizard.find('.nav li').length;
                let move_distance = $wizard.width() / total_steps;
                let index_temp = index;
                let vertical_level = 0;

                let mobile_device = $(document).width() < 600 && $total > 3;

                if (mobile_device) {
                    move_distance = $wizard.width() / 2;
                    index_temp = index % 2;
                    $li_width = 50;
                }

                $wizard.find('.nav li').css('width', $li_width + '%');

                let step_width = move_distance;
                move_distance = move_distance * index_temp;

                let $current = index + 1;

                if ($current == 1 || (mobile_device == true && (index % 2 == 0))) {
                    move_distance -= 8;
                } else if ($current == total_steps || (mobile_device == true && (index % 2 == 1))) {
                    move_distance += 8;
                }

                if (mobile_device) {
                    let x: any = index / 2;
                    vertical_level = parseInt(x, 10);
                    vertical_level = vertical_level * 38;
                }

                $wizard.find('.moving-tab').css('width', step_width);
                $('.moving-tab').css({
                    'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
                    'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'

                });
                $('.moving-tab').css('transition', 'transform 0s');
            },

            onTabClick: function (tab: any, navigation: any, index: any) {

                const $valid = $('.card-wizard form').valid();
                if (!$valid || (index == 2 && status != successMsg)) {
                    return false;
                } else {
                    return true;
                }
            },

            onTabShow: function (tab: any, navigation: any, index: any) {
                var $total = navigation.find('li').length;
                var $current = index + 1;

                var $wizard = navigation.closest('.card-wizard');

                // If it's the last tab then hide the last button and show the finish instead
                if ($current >= $total) {
                    $($wizard).find('.btn-next').hide();
                    $($wizard).find('.btn-finish').show();
                } else {
                    $($wizard).find('.btn-next').show();
                    $($wizard).find('.btn-finish').hide();
                }

                let button_text = navigation.find('li:nth-child(' + $current + ') a').html();

                setTimeout(function () {
                    $('.moving-tab').html(button_text);
                }, 150);

                var checkbox = $('.footer-checkbox');

                if (index == 0) {
                    $(checkbox).css({
                        'opacity': '0',
                        'visibility': 'hidden',
                        'position': 'absolute'
                    });
                } else {
                    $(checkbox).css({
                        'opacity': '1',
                        'visibility': 'visible'
                    });
                }

                $total = $wizard.find('.nav li').length;
                let $li_width = 100 / $total;

                let total_steps = $wizard.find('.nav li').length;
                let move_distance = $wizard.width() / total_steps;
                let index_temp = index;
                let vertical_level = 0;

                let mobile_device = $(document).width() < 600 && $total > 3;

                if (mobile_device) {
                    move_distance = $wizard.width() / 2;
                    index_temp = index % 2;
                    $li_width = 50;
                }

                $wizard.find('.nav li').css('width', $li_width + '%');

                let step_width = move_distance;
                move_distance = move_distance * index_temp;

                $current = index + 1;

                // if($current == 1 || (mobile_device == true && (index % 2 == 0) )){
                //     move_distance -= 8;
                // } else if($current == total_steps || (mobile_device == true && (index % 2 == 1))){
                //     move_distance += 8;
                // }

                if (mobile_device) {
                    let x: any = index / 2;
                    vertical_level = parseInt(x, 10);
                    vertical_level = vertical_level * 38;
                }

                $wizard.find('.moving-tab').css('width', step_width);
                $('.moving-tab').css({
                    'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
                    'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'

                });
            }
        });

        // Prepare the preview for profile picture
        $('#wizard-picture').change(function () {
            const input = $(this);

            if (input[0].files && input[0].files[0]) {
                const reader: any = new FileReader();

                reader.onload = function (e: FileReaderEvent) {
                    $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
                };
                reader.readAsDataURL(input[0].files[0]);
            }
        });

        $('[data-toggle="wizard-radio"]').click(function () {
            let wizard = $(this).closest('.card-wizard');
            wizard.find('[data-toggle="wizard-radio"]').removeClass('active');
            $(this).addClass('active');
            $(wizard).find('[type="radio"]').removeAttr('checked');
            $(this).find('[type="radio"]').attr('checked', 'true');
        });

        $('[data-toggle="wizard-checkbox"]').click(function () {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $(this).find('[type="checkbox"]').removeAttr('checked');
            } else {
                $(this).addClass('active');
                $(this).find('[type="checkbox"]').attr('checked', 'true');
            }
        });

        $('.set-full-height').css('height', 'auto');

    }

    ngAfterViewInit() {

        $(window).resize(() => {
            $('.card-wizard').each(function () {

                const $wizard = $(this);
                const index = $wizard.bootstrapWizard('currentIndex');
                let $total = $wizard.find('.nav li').length;
                let $li_width = 100 / $total;

                let total_steps = $wizard.find('.nav li').length;
                let move_distance = $wizard.width() / total_steps;
                let index_temp = index;
                let vertical_level = 0;

                let mobile_device = $(document).width() < 600 && $total > 3;

                if (mobile_device) {
                    move_distance = $wizard.width() / 2;
                    index_temp = index % 2;
                    $li_width = 50;
                }

                $wizard.find('.nav li').css('width', $li_width + '%');

                let step_width = move_distance;
                move_distance = move_distance * index_temp;

                let $current = index + 1;

                if ($current == 1 || (mobile_device == true && (index % 2 == 0))) {
                    move_distance -= 8;
                } else if ($current == total_steps || (mobile_device == true && (index % 2 == 1))) {
                    move_distance += 8;
                }

                if (mobile_device) {
                    let x: any = index / 2;
                    vertical_level = parseInt(x, 10);
                    vertical_level = vertical_level * 38;
                }

                $wizard.find('.moving-tab').css('width', step_width);
                $('.moving-tab').css({
                    'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
                    'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'
                });

                $('.moving-tab').css({
                    'transition': 'transform 0s'
                });
            });
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        const input = $(this);

        if (input[0].files && input[0].files[0]) {
            const reader: any = new FileReader();

            reader.onload = function (e: FileReaderEvent) {
                $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
            };
            reader.readAsDataURL(input[0].files[0]);
        }
    }
}
