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
        path: '/admin/login',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let data = await controller.admin_controller.admin_login(payloadData)
            return data
        },
        config: {
            description: 'login admin',
            tags: ['api', 'admin'],
            validate: {
                payload: {
                    email: joi.string().required().trim(),
                    password: joi.string().required().trim()
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
        path: '/admin/get_all_surgeon',
        handler: async (request, reply) => {
            let userData = request.auth.credentials
            let query = request.query
            let data = await controller.admin_controller.get_surgen(userData, query)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Get surgeon List for approve and reject',
            tags: ['api', 'admin'],

            validate: {
                headers: universal_functions.authorizationHeaderObj,
                query: {
                    searchUser: joi.string(),
                    isAdminApprove: joi.any().allow(['all', true, false]).required(),
                    type: joi.any().allow(['all', constant.login_type.gps, constant.login_type.okta]).required(),
                    limit: joi.number().integer().required(),
                    skip: joi.number().integer().required()
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
        path: '/admin/get_all_block_surgeon',
        handler: async (request, reply) => {
            let userData = request.auth.credentials
            let query = request.query
            let data = await controller.admin_controller.get_all_block_surgeon(userData, query)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Get surgeon List for block and unblock',
            tags: ['api', 'admin'],

            validate: {
                headers: universal_functions.authorizationHeaderObj,
                query: {
                    searchUser: joi.string(),
                    isblock: joi.any().allow(['all', true, false]).required(),
                    limit: joi.number().integer().required(),
                    skip: joi.number().integer().required()
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
        path: '/admin/all_surgeon_for_verify',
        handler: async (request, reply) => {
            let userData = request.auth.credentials
            let query = request.query
            let data = await controller.admin_controller.all_surgeon_for_verify(userData, query)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Get surgeon List for verify unverify',
            tags: ['api', 'admin'],

            validate: {
                headers: universal_functions.authorizationHeaderObj,
                query: {
                    searchUser: joi.string(),
                    isAdminVerified: joi.any().allow(['all', true, false]).required(),
                    limit: joi.number().integer().required(),
                    skip: joi.number().integer().required()
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
        path: '/admin/approve_reject',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let userData = request.auth.credentials

            let data = await controller.admin_controller.approve_reject(userData, payloadData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Approve reject of register surgen',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    user_id: joi.number().integer().required(),
                    is_approve: joi.boolean().required(),
                    title: joi.string(),
                    comment: joi.string()
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
        path: '/admin/verify_unverify',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let userData = request.auth.credentials

            let data = await controller.admin_controller.verify_unverify(userData, payloadData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Approve reject of register surgen',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    user_id: joi.number().integer().required(),
                    is_verify: joi.boolean().required()
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
        path: '/admin/add_content',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let data = await controller.admin_controller.add_page_content(payloadData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Add page content',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    title: joi.string().required(),
                    text: joi.string().required().trim(),
                    type: joi.number().integer().required().valid([0, 1]).description('0 for hippa , 1 for FAQ')
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
        path: '/admin/get_page',
        handler: async (request, reply) => {
            let data = await controller.admin_controller.page_content()
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'get Page Content',
            tags: ['api', 'admin'],
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
        method: 'GET',
        path: '/admin/get_all_report_post',
        handler: async (request, reply) => {
            let userData = request.auth.credentials
            let query = request.query
            let data = await controller.admin_controller.get_all_report_post(userData, query)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Get surgeon report post',
            tags: ['api', 'admin'],

            validate: {
                headers: universal_functions.authorizationHeaderObj,
                query: {
                    type: joi.any().allow(['all', "case", "comment"]).required(),
                    limit: joi.number().integer().required(),
                    skip: joi.number().integer().required()
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
        path: '/admin/block_user',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let data = await controller.admin_controller.block_user(payloadData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'block user by admin',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    user_id: joi.number().integer().required(),
                    is_block: joi.boolean().required()
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
        path: '/admin/send_push',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let data = await controller.admin_controller.send_push_admin(payloadData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'send push to user',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    title: joi.string().required(),
                    type: joi.any().allow(['all', "surgeons", "gps", "okta"]).required(),
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
        path: '/admin/get_surgeon_for_specialization',
        handler: async (request, reply) => {
            let userData = request.auth.credentials
            let query = request.query
            let data = await controller.admin_controller.get_surgeon_for_specialization(userData, query)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Get surgeon List for specialization',
            tags: ['api', 'admin'],

            validate: {
                headers: universal_functions.authorizationHeaderObj,
                query: {
                    searchUser: joi.string(),
                    type: joi.any().allow(['all', "gps", "okta"]).required(),
                    limit: joi.number().integer().required(),
                    skip: joi.number().integer().required()
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
        path: '/admin/assign_title_to_user',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let userData = request.auth.credentials
            let data = await controller.admin_controller.assign_title_to_user(userData, payloadData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Assign title to user',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    user_id: joi.number().integer().required(),
                    title: joi.string().required(),
                    name: joi.string().required()
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
        path: '/admin/staff_directory',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let userData = request.auth.credentials
            let data = await controller.admin_controller.staff_directory(userData, payloadData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Assign title to user',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    name: joi.string().required(),
                    title: joi.string(),
                    photo: joi.string(),
                    email: joi.string(),
                    phone_number: joi.string(),
                    department: joi.string(),
                    location: joi.string(),
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
        path: '/admin/get_staff_directory',
        handler: async (request, reply) => {
            let userData = request.auth.credentials
            let query = request.query
            let data = await controller.admin_controller.get_staff_directory(userData, query)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Get staff directory',
            tags: ['api', 'admin'],

            validate: {
                headers: universal_functions.authorizationHeaderObj,
                query: {
                    searchUser: joi.string(),
                    limit: joi.number().integer().required(),
                    skip: joi.number().integer().required()
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
        method: 'DELETE',
        path: '/admin/case',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let userData = request.auth.credentials
            let data = await controller.admin_controller.delete_case(payloadData, userData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Delete case by admin',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    case_id: joi.number().integer().required()
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
        method: 'PUT',
        path: '/admin/approve_reject_case',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let userData = request.auth.credentials
            let data = await controller.admin_controller.approve_reject_case(userData, payloadData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Approve/Reject case by admin',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    case_id: joi.number().integer().required(),
                    status: joi.number().integer().required().valid([1, 2]).description("1-approve, 2-reject"),
                    reject_reason: joi.string().description("Reason for reject case")
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
        method: 'DELETE',
        path: '/admin/comment',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let userData = request.auth.credentials
            let data = await controller.admin_controller.delete_comment(payloadData, userData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Delete comment by admin',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    comment_id: joi.number().integer().required()
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
        path: '/admin/get_case',
        handler: async (request, reply) => {
            let userData = request.auth.credentials
            let query = request.query
            let data = await controller.admin_controller.get_case(userData, query)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'get surgeon case list',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                query: {
                    user_id: joi.number().integer(),
                    status: joi.number().integer(),
                    limit: joi.number().integer().required(),
                    skip: joi.number().integer().required()
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
        path: '/admin/get_case_by_id',
        handler: async (request, reply) => {
            let query = request.query
            let data = await controller.admin_controller.get_case_by_id(query)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'get specific surgeon case',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                query: {
                    case_id: joi.number().integer()
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
        path: '/admin/get_comment',
        handler: async (request, reply) => {
            let userData = request.auth.credentials
            let queryData = request.query;

            let data = await controller.case_controller.get_comment(userData, queryData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'get comment list',
            tags: ['api', 'case'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                query: {
                    case_id: joi.number().integer().required(),
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
        path: '/open/notification',
        handler: async (request, reply) => {
            let payloadData = request.payload;            
            let data = await controller.admin_controller.notification(payloadData, request)
            return data
        },
        config: {
            auth: 'simple',
            description: 'open notification',
            tags: ['api', 'open'],
            validate: {
                payload: {
                    type: joi.string().required().valid(["event", "news"]),
                    other: joi.string(),
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
        method: 'DELETE',
        path: '/admin/staff_directory',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let userData = request.auth.credentials
            let data = await controller.admin_controller.delete_staff_directory(payloadData, userData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Delete staff directory by admin',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    staff_directory_id: joi.number().integer().required()
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
        path: '/admin/get_all_feedback',
        handler: async (request, reply) => {
            let userData = request.auth.credentials
            let query = request.query
            let data = await controller.admin_controller.get_all_feedback(userData, query)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Get all feedback',
            tags: ['api', 'admin'],

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
        path: '/admin/reply_feedback',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let data = await controller.admin_controller.reply_feedback(payloadData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'admin notification',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    feedback_id: joi.number().integer().required(),
                    msg: joi.string().required(),
                    subject: joi.string().required(),
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
        path: '/admin/create_event',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let userData = request.auth.credentials
            let data = await controller.admin_controller.create_event(userData, payloadData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'admin notification',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    title: joi.string().required(),
                    location: joi.object({
                        street_address: joi.string(),
                        city: joi.string(),
                        state: joi.string(),
                        country: joi.string(),
                        pincode: joi.string()
                    }).optional(),
                    latitude: joi.number().optional(),
                    longitude: joi.number().optional(),
                    start_datetime: joi.string().optional(),
                    end_datetime: joi.string().optional(),
                    list_of_attendees: joi.array().items(joi.number().integer()).required(),
                    send_notification: joi.boolean().optional(),
                    description: joi.string().optional(),
                    url: joi.string().optional(),
                    reminder_type1: joi.number().integer().optional(),
                    reminder_type2: joi.number().integer().optional(),
                    reminder1_datetime: joi.string().optional(),
                    reminder2_datetime: joi.string().optional(),
                    push_msg: joi.string().optional(),
                    email_subject: joi.string().optional(),
                    email_body: joi.string().optional(),
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    // payloadType: 'form',
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/admin/edit_event',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let userData = request.auth.credentials
            let data = await controller.admin_controller.edit_event(userData, payloadData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'admin notification',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    event_id: joi.number().integer().required(),
                    title: joi.string().required(),
                    location: joi.object({
                        street_address: joi.string(),
                        city: joi.string(),
                        state: joi.string(),
                        country: joi.string(),
                        pincode: joi.string()
                    }).optional(),
                    latitude: joi.number().optional(),
                    longitude: joi.number().optional(),
                    start_datetime: joi.string().optional(),
                    end_datetime: joi.string().optional(),
                    list_of_attendees: joi.array().items(joi.number().integer()).required(),
                    description: joi.string().optional(),
                    url: joi.string().optional(),
                    reminder_type1: joi.number().integer().optional(),
                    reminder_type2: joi.number().integer().optional(),
                    reminder1_datetime: joi.string().optional(),
                    reminder2_datetime: joi.string().optional(),
                    push_msg: joi.string().optional(),
                    email_subject: joi.string().optional(),
                    email_body: joi.string().optional(),
                },
                failAction: universal_functions.failActionFunction
            },
            plugins: {
                'hapi-swagger': {
                    responseMessages: constant.swagger_msg
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/admin/get_event',
        handler: async (request, reply) => {
            let query = request.query
            let data = await controller.admin_controller.get_event(query)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'get event list',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                query: {
                    limit: joi.number().integer().required(),
                    skip: joi.number().integer().required()
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
        method: 'DELETE',
        path: '/admin/event',
        handler: async (request, reply) => {
            let payloadData = request.payload;
            let data = await controller.admin_controller.delete_event(payloadData)
            return data
        },
        config: {
            auth: 'adminAuth',
            description: 'Delete private event by admin',
            tags: ['api', 'admin'],
            validate: {
                headers: universal_functions.authorizationHeaderObj,
                payload: {
                    event_id: joi.number().integer().required()
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
];