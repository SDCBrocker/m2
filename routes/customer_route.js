'use strict';
/**
 * Created by Akash Deep on 09/05/2019.
 */

const universal_functions = require('../utils/universal_functions');
const joi = require('joi');
const constant = require('../lib/constant');
const controller = require('../controllers')
module.exports = [
    {
        method: 'POST',
        path: '/user/register',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let data = await controller.customer_controller.sign_up(payloadData)
            return data
        },
        config: {
            description: 'Register user',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    name: joi.string().required(),
                    country_code:joi.string().required(),
                    phone_number:joi.string().required(),
                    image: joi.string().trim(),
                    email: joi.string().required().trim(),
                    password: joi.string().required(),
                    device_type: joi.string().required().valid([constant.device_type.android, constant.device_type.ios]),
                    device_token: joi.string().required(),
                    app_version: joi.string().required().trim(),
                    birth_date: joi.string().required(),
                    gender: joi.string().required(),
                    zipcode: joi.number().integer().required(),
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/login',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let data = await controller.customer_controller.login(payloadData)
            return data
        },
        config: {
            description: 'login user',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    email: joi.string().required().trim(),
                    password: joi.string().required().trim(),
                    device_type: joi.string().required().valid([constant.device_type.android, constant.device_type.ios]),
                    device_token: joi.string().required(),
                    app_version: joi.string().required().trim()


                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/check_email',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let data = await controller.customer_controller.check_email(payloadData)
            return data
        },
        config: {
            description: 'check email user',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    email: joi.string().required().trim()
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/check_phone',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let data = await controller.customer_controller.check_phone_number(payloadData)
            return data
        },
        config: {
            description: 'check phone number',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    phone_number: joi.string().required().trim()
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/user/faq',
        handler: async (request, reply) => {
            let userData = request.auth.credentials
            let data = await controller.customer_controller.get_faq(userData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'get faq details',
            tags: ['api', 'user'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/feedback_support',
        handler: async (request, reply) => {
            let userData = request.auth.credentials
            let payloadData = request.payload;
            let data = await controller.customer_controller.feedback_support(userData,payloadData)
            return data
        },
        config: {
            auth: 'userAuth',
            description: 'add feedback OR support',
            tags: ['api', 'user'],
            validate: {
                payload: {
                    title: joi.string().required().trim(),
                    type: joi.number().required().valid([1,2]).description('1 for feedback and 2 for support'),
                },
                headers:universal_functions.authorizationHeaderObj,
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    // {
    //     method: 'POST',
    //     path: '/user/check_other_login',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let data = await controller.customer_controller.check_other_login(payloadData)
    //         return data
    //     },
    //     config: {
    //         description: 'check username user',
    //         tags: ['api', 'surgen'],
    //         validate: {
    //             payload: {
    //                 login_id: joi.string().required().trim(),
    //                 login_type: joi.string().required().valid([constant.login_type.gps, constant.login_type.okta])
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'PUT',
    //     path: '/user/update_username',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let userData = request.auth.credentials
    //         let data = await controller.customer_controller.update_username(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'update username',
    //         tags: ['api', 'user'],
    //         validate: {
    //             payload: {
    //                 username: joi.string().required(),
    //             },
    //             headers: universal_functions.authorizationHeaderObj,
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'PUT',
    //     path: '/user/otp_verify',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let userData = request.auth.credentials
    //         let data = await controller.customer_controller.otp_verify(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'Otp Verify',
    //         tags: ['api', 'user'],
    //         validate: {
    //             payload: {
    //                 otp: joi.number().integer().max(9999).required().description('OTP Should be 4 digit')
    //             },
    //             failAction: universal_functions.failActionFunction,
    //             headers: universal_functions.authorizationHeaderObj
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'PUT',
    //     path: '/user/resent_otp',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let userData = request.auth.credentials
    //         let data = await controller.customer_controller.resent_otp(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'Otp resent',
    //         tags: ['api', 'user'],
    //         validate: {
    //             failAction: universal_functions.failActionFunction,
    //             headers: universal_functions.authorizationHeaderObj
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'GET',
    //     path: '/user/access_token',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         let data = await controller.customer_controller.get_details(userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'get user details',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'PUT',
    //     path: '/user/upload_image',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let data
    //         try {
    //             data = await controller.customer_controller.upload_image(payloadData)
    //         } catch (e) {
    //             conso
    //         }

    //         return data
    //     },
    //     config: {
    //         description: 'Upload image',
    //         tags: ['api', 'user'],
    //         payload: {
    //             maxBytes: 24000000,
    //             parse: true,
    //             output: 'file',
    //             timeout: false
    //         },
    //         validate: {
    //             payload: {
    //                 image: joi.any()
    //                     .meta({ swaggerType: 'file' })
    //                     .optional()
    //                     .description(' file upload any type')
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'PUT',
    //     path: '/user/update_profile',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let userData = request.auth.credentials
    //         let data = await controller.customer_controller.update_profile(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'Update profile',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             payload: {
    //                 name: joi.string().required().description('username in string'),
    //                 profile_pic: joi.string().description('Only image url'),
    //                 status_msg: joi.string().description('status'),
    //                 location: joi.string().description('location'),
    //                 latitude: joi.number().integer(),
    //                 longitude: joi.number().integer(),
    //                 title: joi.string().description('title'),
    //                 is_term: joi.number().integer()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'PUT',
    //     path: '/user/upload_case_file',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let data = await controller.customer_controller.upload_image(payloadData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'Upload any case file',
    //         tags: ['api', 'user'],
    //         payload: {
    //             maxBytes: 500000000,
    //             parse: true,
    //             output: 'file',
    //             timeout: false
    //         },
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             payload: {
    //                 image: joi.any()
    //                     .meta({ swaggerType: 'file' })
    //                     .optional()
    //                     .description(' file upload any type'),
    //                 thumbnail: joi.any()
    //                     .meta({ swaggerType: 'file' })
    //                     .optional()
    //                     .description(' upload thumbnail image')
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'POST',
    //     path: '/user/upload_case',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let userData = request.auth.credentials
    //         let data = await controller.customer_controller.doc_upload(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'user upload',
    //         tags: ['api', 'surgen'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             payload: {
    //                 urls: joi.array().items(joi.object().keys({
    //                     name: joi.string(),
    //                     url: joi.string().required(),
    //                     thumbnail: joi.string().optional(),
    //                     type: joi.string().required(),
    //                     answer1: joi.string(),
    //                     answer2: joi.string(),
    //                     answer3: joi.string(),
    //                     answer4: joi.string(),
    //                 })
    //                 ).required().description('All url image OR video'),
    //                 description: joi.string(),
    //                 old_case_id: joi.number().integer()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 // payloadType : 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'GET',
    //     path: '/user/get_case',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         let query = request.query
    //         let data = await controller.customer_controller.get_case(userData, query)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'get user case list',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             query: {
    //                 case_id: joi.number().integer(),
    //                 other_user_id: joi.number().integer(),
    //                 status: joi.number().integer().valid([0, 1, 2, 3]).description('0-pending, 1-approve, 2-rejected, 3-all'),
    //                 is_my: joi.boolean().required().default(false).description('true means my case  and false all case'),
    //                 limit: joi.number().integer().required(),
    //                 skip: joi.number().integer().required()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'GET',
    //     path: '/user/caption_search',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         let query = request.query
    //         let data = await controller.customer_controller.get_case_caption_search(userData, query)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'get user case with caption search',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             query: {
    //                 caption: joi.string().required(),
    //                 limit: joi.number().integer().required(),
    //                 skip: joi.number().integer().required()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'GET',
    //     path: '/user/get_like_case',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         let query = request.query
    //         let data = await controller.customer_controller.get_like_case(userData, query)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'get user case list',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             query: {
    //                 limit: joi.number().integer().required(),
    //                 skip: joi.number().integer().required()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'PUT',
    //     path: '/user/like_unlike_case',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         const payloadData = request.payload;
    //         let data = await controller.customer_controller.like_unlike_case(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'Like and link the case',
    //         tags: ['api', 'user'],
    //         validate: {
    //             payload: {
    //                 case_id: joi.number().integer().required(),
    //                 is_like: joi.boolean().required().description('true means like and false means undo'),
    //             },
    //             headers: universal_functions.authorizationHeaderObj,
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'POST',
    //     path: '/user/report_user',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         const payloadData = request.payload;
    //         let data = await controller.customer_controller.report_user(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'report user',
    //         tags: ['api', 'user'],
    //         validate: {
    //             payload: {
    //                 user_id: joi.number().integer().required()
    //             },
    //             headers: universal_functions.authorizationHeaderObj,
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'POST',
    //     path: '/user/mute_user',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         const payloadData = request.payload;
    //         let data = await controller.customer_controller.mute_user(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'mute user',
    //         tags: ['api', 'user'],
    //         validate: {
    //             payload: {
    //                 user_id: joi.number().integer().required(),
    //                 is_mute: joi.boolean().required().description('true means like and false means undo'),
    //             },
    //             headers: universal_functions.authorizationHeaderObj,
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'POST',
    //     path: '/user/follow_user',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         const payloadData = request.payload;
    //         let data = await controller.customer_controller.follow_user(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'follow user',
    //         tags: ['api', 'user'],
    //         validate: {
    //             payload: {
    //                 user_id: joi.number().integer().required(),
    //                 is_follow: joi.boolean().required().description('true means follow and false means not follow'),
    //             },
    //             headers: universal_functions.authorizationHeaderObj,
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'GET',
    //     path: '/user/follow_user_list',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         let query = request.query
    //         let data = await controller.customer_controller.follow_user_list(userData, query)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'get follow user list',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             query: {
    //                 text: joi.string(),
    //                 limit: joi.number().integer().required(),
    //                 skip: joi.number().integer().required()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'GET',
    //     path: '/user/user_list',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         let query = request.query
    //         let data = await controller.customer_controller.user_list_search(userData, query)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'get  user list with search',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             query: {
    //                 text: joi.string(),
    //                 limit: joi.number().integer().required(),
    //                 skip: joi.number().integer().required()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'GET',
    //     path: '/user/notification_user_list',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         let query = request.query
    //         let data = await controller.customer_controller.notification_user_list(userData, query)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'get notification user list',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             query: {
    //                 type: joi.string().required().valid(["my", "other"]),
    //                 limit: joi.number().integer().required(),
    //                 skip: joi.number().integer().required()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'PUT',
    //     path: '/user/update_notification',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let userData = request.auth.credentials
    //         let data = await controller.customer_controller.update_notification(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'Update notification',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             payload: {
    //                 notification_comment: joi.number().integer().required().valid([0, 1]),
    //                 notification_case: joi.number().integer().required().valid([0, 1]),
    //                 notification_like: joi.number().integer().required().valid([0, 1])
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'PUT',
    //     path: '/user/forgot_password',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let userData = request.auth.credentials
    //         let data = await controller.customer_controller.forgot_password(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         description: 'forgot password',
    //         tags: ['api', 'user'],
    //         validate: {
    //             payload: {
    //                 email: joi.string().required().trim()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'POST',
    //     path: '/user/reset_password',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let userData = request.auth.credentials
    //         let data = await controller.customer_controller.reset_password(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         description: 'forgot password',
    //         tags: ['api', 'user'],
    //         validate: {
    //             payload: {
    //                 email: joi.string().required().trim(),
    //                 forgot_otp: joi.number().integer().required(),
    //                 password: joi.string().required().trim(),
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'DELETE',
    //     path: '/user/notification',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let userData = request.auth.credentials
    //         let data = await controller.customer_controller.notification_delete(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'delete notification',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             payload: {
    //                 notification_id: joi.string().required().trim()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'GET',
    //     path: '/user/get_staff_directory',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         let query = request.query
    //         let data = await controller.admin_controller.get_staff_directory(userData, query)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'Get staff directory',
    //         tags: ['api', 'admin'],

    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             query: {
    //                 searchUser: joi.string(),
    //                 limit: joi.number().integer().required(),
    //                 skip: joi.number().integer().required()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'DELETE',
    //     path: '/user/delete_case',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         const payloadData = request.payload;
    //         let data = await controller.customer_controller.delete_case(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'delete the case',
    //         tags: ['api', 'user'],
    //         validate: {
    //             payload: {
    //                 case_id: joi.number().integer().required()
    //             },
    //             headers: universal_functions.authorizationHeaderObj,
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'GET',
    //     path: '/user/get_all_user',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         let query = request.query
    //         let data = await controller.admin_controller.get_surgen(userData, query)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'Get user List',
    //         tags: ['api', 'user'],

    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             query: {
    //                 searchUser: joi.string(),
    //                 isAdminApprove: joi.any().allow(['all', true, false]).required(),
    //                 limit: joi.number().integer().required(),
    //                 skip: joi.number().integer().required()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'PUT',
    //     path: '/user/change_event_news',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let userData = request.auth.credentials
    //         let data = await controller.customer_controller.change_event_news(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'change event news',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             payload: {
    //                 type: joi.string().required().valid(["event", "news"]),
    //                 is_on: joi.number().integer().required().valid([1, 0]).description('1 for on 0 for off')
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'PUT',
    //     path: '/user/logout',
    //     handler: async (request, reply) => {
    //         let payloadData = request.payload;
    //         let userData = request.auth.credentials
    //         let data = await controller.customer_controller.logout(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'logout users',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'GET',
    //     path: '/user/get_event',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         let query = request.query
    //         let data = await controller.customer_controller.get_event(userData, query)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'get event list',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             query: {
    //                 limit: joi.number().integer().required(),
    //                 skip: joi.number().integer().required()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'GET',
    //     path: '/user/get_event_details',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         let query = request.query
    //         let data = await controller.customer_controller.get_event_details(userData, query)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'get private event details',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             query: {
    //                 event_id: joi.number().integer().required()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'POST',
    //     path: '/user/block_user',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         let payloadData = request.payload;
    //         let data = await controller.customer_controller.block_user(payloadData, userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'block user',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             payload: {
    //                 user_id: joi.number().integer().required(),
    //                 is_block: joi.boolean().required()
    //             },
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'GET',
    //     path: '/user/blocked_users',
    //     handler: async (request, reply) => {
    //         let userData = request.auth.credentials
    //         let data = await controller.customer_controller.blocked_users(userData)
    //         return data
    //     },
    //     config: {
    //         auth: 'userAuth',
    //         description: 'blocked users',
    //         tags: ['api', 'user'],
    //         validate: {
    //             headers: universal_functions.authorizationHeaderObj,
    //             failAction: universal_functions.failActionFunction
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 payloadType: 'form',
    //                 responseMessages: constant.swagger_msg
    //             }
    //         }
    //     }
   // },
];