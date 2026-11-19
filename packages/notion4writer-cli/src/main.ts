#!/usr/bin/env node
import * as nodePath from 'node:path'
import * as nodeFs from 'node:fs/promises'
import * as nodeCrypto from 'node:crypto'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Client as NotionClient } from '@notionhq/client'
import { CliClient, CliFiles, CliRequester, CliSlug, pageCmd } from './cli.ts'
import { addFilter } from './lib/filter.ts'

yargs(hideBin(process.argv))
    .scriptName('notion4writer')
    .env('NOTION4WRITER')
    .command(
        'page',
        'Fetch pages from Notion database',
        (yargs) =>
            yargs
                .env('NOTION4WRITER')
                .option('auth', {
                    type: 'string',
                    describe: 'Notion integration token',
                    demandOption: true,
                })
                .option('data-source-id', {
                    type: 'string',
                    describe: 'Notion data source ID',
                    demandOption: true,
                })
                .option('limit', {
                    type: 'number',
                    describe: 'Limit number of pages to fetch',
                    demandOption: false,
                    default: 1
                })
                .option('title-prop-name', {
                    type: 'string',
                    describe: 'Notion title property name',
                    demandOption: true,
                    default: 'Title'
                })
                .option('tags-prop-name', {
                    type: 'string',
                    describe: 'Notion tags property name',
                    demandOption: true,
                    default: 'Tags'
                })
                .option('slug-prop-name', {
                    type: 'string',
                    describe: 'Notion slug property name',
                    demandOption: true,
                    default: 'URL'
                })
                .option('filter-slug', {
                    type: 'string',
                    describe: 'Filter by slug',
                    demandOption: false,
                })
                .option('filter-slug-op', {
                    type: 'string',
                    choices: [
                        'equals',
                        'does_not_equal',
                        'contains',
                        'does_not_contain',
                        'starts_with',
                        'ends_with',
                    ],
                    describe: 'Filter by slug operation',
                    demandOption: false,
                    default: 'equals'
                })
                .option('filter-title', {
                    type: 'string',
                    describe: 'Filter by title',
                    demandOption: false,
                })
                .option('filter-title-op', {
                    type: 'string',
                    choices: [
                        'equals',
                        'does_not_equal',
                        'contains',
                        'does_not_contain',
                        'starts_with',
                        'ends_with',
                    ],
                    describe: 'Filter by title operation',
                    demandOption: false,
                    default: 'contains'
                })
                .option('filter-recenting', {
                    type: 'number',
                    describe: 'Specify the time range from the current time in seconds',
                    demandOption: false,
                })
                .option('base-dir', {
                    type: 'string',
                    describe: 'Base directory for storing files',
                    demandOption: true,
                    default: '.'
                }),
        async (argv) => {
            const { InitFlavor, defaultZennFlavorHandler, Meta, Filter } = await import('@hankei6km/notion4writer-flavor-zenn')
            const client = new CliClient(new NotionClient({ auth: argv.auth }))
            const slug = new CliSlug(URL, nodePath)
            const files = new CliFiles(URL, nodeFs, nodePath, nodeCrypto, argv['base-dir'])
            const requester = new CliRequester(fetch)
            await pageCmd({
                client,
                slug,
                data_source_id: argv['data-source-id'],
                limit: argv['limit'],
                files,
                requester,
                flavor: new InitFlavor({
                    propsMapping: {
                        title: argv['title-prop-name'],
                        tags: argv['tags-prop-name'],
                        slug: argv['slug-prop-name']
                    },
                    requester: requester
                }).flavor,
                addFilter: (filter) => {
                    addFilter(filter, {
                        filterSlug: argv['filter-slug'],
                        filterSlugOp: argv['filter-slug-op'],
                        filterTitle: argv['filter-title'],
                        filterTitleOp: argv['filter-title-op'],
                        filterRecenting: argv['filter-recenting']
                    })
                }
            })
        }
    )
    .demandCommand(1)
    .help()
    .strict()
    .parse()
