create database if not exists service;
use service;

create table status_user
(
    id          int unsigned auto_increment
        primary key,
    status_name varchar(255)                        not null,
    created_at  timestamp default CURRENT_TIMESTAMP not null
);

INSERT INTO service.status_user (id, status_name, created_at)
VALUES (1, 'default', '2024-12-07 16:27:30');
INSERT INTO service.status_user (id, status_name, created_at)
VALUES (2, 'readonly', '2024-12-07 16:27:30');
INSERT INTO service.status_user (id, status_name, created_at)
VALUES (3, 'blocked', '2024-12-07 16:27:30');


create table status_product
(
    id          int unsigned auto_increment
        primary key,
    status_name varchar(255)                        not null,
    created_at  timestamp default CURRENT_TIMESTAMP not null
);

INSERT INTO service.status_product (id, status_name, created_at)
VALUES (1, 'on sale', '2024-12-07 16:27:30');
INSERT INTO service.status_product (id, status_name, created_at)
VALUES (2, 'hide', '2024-12-07 16:27:30');

create table status_transaction
(
    id          int unsigned auto_increment
        primary key,
    status_name varchar(255)                        not null,
    created_at  timestamp default CURRENT_TIMESTAMP not null
);

INSERT INTO service.status_transaction (id, status_name, created_at)
VALUES (1, 'purchased', '2024-12-07 16:52:52');
INSERT INTO service.status_transaction (id, status_name, created_at)
VALUES (2, 'pay processing', '2024-12-07 16:52:52');
INSERT INTO service.status_transaction (id, status_name, created_at)
VALUES (3, 'shipped', '2024-12-07 16:52:52');
INSERT INTO service.status_transaction (id, status_name, created_at)
VALUES (4, 'delivered', '2024-12-07 16:52:52');
INSERT INTO service.status_transaction (id, status_name, created_at)
VALUES (5, 'returned', '2024-12-07 16:52:52');
INSERT INTO service.status_transaction (id, status_name, created_at)
VALUES (6, 'partial returned', '2024-12-07 16:52:52');
INSERT INTO service.status_transaction (id, status_name, created_at)
VALUES (7, 'canceled', '2024-12-07 16:52:52');

create table status_shipment
(
    id          int unsigned auto_increment
        primary key,
    status_name varchar(255)                        not null,
    created_at  timestamp default CURRENT_TIMESTAMP not null
);

INSERT INTO service.status_shipment (id, status_name, created_at)
VALUES (1, 'queued', '2024-12-07 22:56:25');
INSERT INTO service.status_shipment (id, status_name, created_at)
VALUES (2, 'in transit', '2024-12-07 22:56:25');
INSERT INTO service.status_shipment (id, status_name, created_at)
VALUES (3, 'delivered', '2024-12-07 22:56:25');
INSERT INTO service.status_shipment (id, status_name, created_at)
VALUES (4, 'error', '2024-12-07 22:56:25');

-- service tables
create table admin
(
    id         int unsigned auto_increment
        primary key,
    admin_id   varchar(255)                        not null,
    pwd        varchar(255)                        not null comment 'password',
    name       varchar(255)                        not null,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    constraint admin_id_unique
        unique (admin_id)
);

create table user_group
(
    id          int unsigned auto_increment
        primary key,
    group_name  varchar(100)                        not null,
    description varchar(255) null,
    created_at  timestamp default CURRENT_TIMESTAMP not null
);

create table user
(
    id             int unsigned auto_increment
        primary key,
    user_id        varchar(255)                        not null,
    pwd            varchar(255)                        not null comment 'password',
    branch_name    varchar(255)                        not null,
    branch_manager varchar(255)                        not null,
    branch_contact varchar(20)                         not null,
    group_id       int unsigned                           null,
    status         int unsigned default '1'               not null,
    created_at     timestamp default CURRENT_TIMESTAMP not null,
    updated_at     datetime  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint user_id_unique
        unique (user_id),
    constraint user_status_user_id_fk
        foreign key (status) references status_user (id),
    constraint user_user_group_id_fk
        foreign key (group_id) references user_group (id)
);
);

create table product
(
    id            int unsigned auto_increment
        primary key,
    product_name  varchar(255)                           not null,
    description   varchar(255) default '' null,
    image_urls    json null,
    product_price decimal(10, 2)                         not null,
    status        int unsigned default '1'               not null,
    created_at    timestamp    default CURRENT_TIMESTAMP not null,
    constraint product_status_product_id_fk
        foreign key (status) references status_product (id)
);

create table user_group_product
(
    id         int unsigned auto_increment
        primary key,
    group_id   int unsigned                        not null,
    product_id int unsigned                        not null,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    constraint user_group_product_unique
        unique (group_id, product_id),
    constraint user_group_product_product_id_fk
        foreign key (product_id) references product (id),
    constraint user_group_product_user_group_id_fk
        foreign key (group_id) references user_group (id)
);

create index user_group_product_group_id_index
    on user_group_product (group_id);

create index user_group_product_product_id_index
    on user_group_product (product_id);

create table cart_user_product
(
    id         int unsigned auto_increment
        primary key,
    user_id    int unsigned                        not null,
    product_id int unsigned                        not null,
    count      int                                 not null,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    constraint cart_user_product_product_id_fk
        foreign key (product_id) references product (id),
    constraint cart_user_product_user_id_fk
        foreign key (user_id) references user (id)
);

create index cart_user_product_product_id_index
    on cart_user_product (product_id);

create index cart_user_product_user_id_index
    on cart_user_product (user_id);

create table payment
(
    id             int unsigned auto_increment
        primary key,
    pay_method     varchar(255)                        null,
    payment_key    varchar(255)                        null comment 'from toss',
    order_id       char(36)                            not null comment 'from toss uuid_v4',
    paid_amount    decimal(10, 2)                      not null comment 'from toss',
    balance_amount decimal(10, 2)                      not null comment 'when canceled',
    receipt_url    varchar(255)                        null comment 'toss receipt url',
    paid_at        datetime                            not null,
    created_at     timestamp default CURRENT_TIMESTAMP not null,
    updated_at     datetime  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint payment_order_id_unique
        unique (order_id)
);

create table transaction
(
    id         int unsigned auto_increment
        primary key,
    payment_id int unsigned                           not null,
    tx_name    varchar(255)                           not null,
    tx_note    text                                   null,
    user_id    int unsigned                           not null comment 'user ref key',
    status     int unsigned default '1'               not null,
    created_at timestamp    default CURRENT_TIMESTAMP not null,
    updated_at datetime     default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint transaction_payment_id_fk
        foreign key (payment_id) references payment (id),
    constraint transaction_status_transaction_id_fk
        foreign key (status) references status_transaction (id),
    constraint transaction_user_id_fk
        foreign key (user_id) references user (id)
);

create table transaction_product
(
    id         int unsigned auto_increment
        primary key,
    tx_id      int unsigned                           not null,
    product_id int unsigned                           not null,
    count      int                                 not null,
    price      decimal(10, 2)                      not null,
    status     int unsigned default '1'               not null,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    constraint transaction_product_product_id_fk
        foreign key (product_id) references product (id),
    constraint transaction_product_status_transaction_id_fk
        foreign key (status) references status_transaction (id),
    constraint transaction_product_transaction_id_fk
        foreign key (tx_id) references transaction (id)
);

create table courier
(
    id           int unsigned auto_increment
        primary key,
    courier_name varchar(255) null,
    api_url      varchar(255) null,
    created_at   timestamp default CURRENT_TIMESTAMP not null
);

create table shipment
(
    id              int unsigned auto_increment
        primary key,
    tx_id           int unsigned                        not null,
    courier_id      int unsigned                        null,
    address         varchar(255)                        not null,
    postal_code     varchar(10)                         not null,
    recipient_name  varchar(255)                        not null,
    recipient_phone varchar(20)                         not null,
    tracking_no     varchar(255)                        null,
    status          int unsigned                        not null,
    created_at      timestamp default CURRENT_TIMESTAMP not null,
    updated_at      datetime  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint shipment_courier_id_fk
        foreign key (courier_id) references courier (id),
    constraint shipment_status_shipment_id_fk
        foreign key (status) references status_shipment (id),
    constraint shipment_transaction_id_fk
        foreign key (tx_id) references transaction (id)
);

create table notice
(
    id         int unsigned auto_increment
        primary key,
    title      varchar(255) null,
    content    text null,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    updated_at datetime  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
);















