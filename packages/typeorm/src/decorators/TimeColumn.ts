import { Column, ColumnOptions, getMetadataArgsStorage, PrimaryColumn } from 'typeorm';

export const TIME_COLUMN_METADATA_KEY = Symbol('timescale:time-column');

export interface TimeColumnMetadata {
  propertyKey: string | symbol;
  columnName: string;
}

export interface TimeColumnOptions extends ColumnOptions {
  primary?: boolean;
}

export function TimeColumn(options?: TimeColumnOptions) {
  return function (target: any, propertyKey: string | symbol) {
    const isPrimary = options?.primary === true;

    const baseOptions: ColumnOptions = {
      type: 'timestamptz',
      ...options,
    };

    if (!isPrimary && baseOptions.nullable === undefined) {
      baseOptions.nullable = false;
    }

    const { primary, ...columnOptions } = baseOptions as TimeColumnOptions;

    const metadata: TimeColumnMetadata = {
      propertyKey,
      columnName: (options?.name as string) || propertyKey.toString(),
    };

    Reflect.defineMetadata(TIME_COLUMN_METADATA_KEY, metadata, target.constructor);

    if (isPrimary) {
      const { nullable, ...primaryOptions } = columnOptions;
      PrimaryColumn(primaryOptions)(target, propertyKey);
    } else {
      Column(columnOptions)(target, propertyKey);
    }
  };
}

export function validateTimeColumn(target: Function): TimeColumnMetadata {
  const metadata = Reflect.getMetadata(TIME_COLUMN_METADATA_KEY, target);

  if (!metadata) {
    throw new Error('Hypertables must have exactly one column decorated with @TimeColumn');
  }

  return metadata;
}
