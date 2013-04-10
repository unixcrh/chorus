require 'sequel/no_core_ext'
require 'sequel/adapters/jdbc'
require 'sequel/adapters/jdbc/postgresql'
Sequel::Postgres.client_min_messages = :notice
