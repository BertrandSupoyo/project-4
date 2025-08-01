
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Substation
 * 
 */
export type Substation = $Result.DefaultSelection<Prisma.$SubstationPayload>
/**
 * Model MeasurementSiang
 * 
 */
export type MeasurementSiang = $Result.DefaultSelection<Prisma.$MeasurementSiangPayload>
/**
 * Model MeasurementMalam
 * 
 */
export type MeasurementMalam = $Result.DefaultSelection<Prisma.$MeasurementMalamPayload>
/**
 * Model AdminUser
 * 
 */
export type AdminUser = $Result.DefaultSelection<Prisma.$AdminUserPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Substations
 * const substations = await prisma.substation.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Substations
   * const substations = await prisma.substation.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.substation`: Exposes CRUD operations for the **Substation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Substations
    * const substations = await prisma.substation.findMany()
    * ```
    */
  get substation(): Prisma.SubstationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.measurementSiang`: Exposes CRUD operations for the **MeasurementSiang** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MeasurementSiangs
    * const measurementSiangs = await prisma.measurementSiang.findMany()
    * ```
    */
  get measurementSiang(): Prisma.MeasurementSiangDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.measurementMalam`: Exposes CRUD operations for the **MeasurementMalam** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MeasurementMalams
    * const measurementMalams = await prisma.measurementMalam.findMany()
    * ```
    */
  get measurementMalam(): Prisma.MeasurementMalamDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.adminUser`: Exposes CRUD operations for the **AdminUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AdminUsers
    * const adminUsers = await prisma.adminUser.findMany()
    * ```
    */
  get adminUser(): Prisma.AdminUserDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.13.0
   * Query Engine version: 361e86d0ea4987e9f53a565309b3eed797a6bcbd
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Substation: 'Substation',
    MeasurementSiang: 'MeasurementSiang',
    MeasurementMalam: 'MeasurementMalam',
    AdminUser: 'AdminUser'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "substation" | "measurementSiang" | "measurementMalam" | "adminUser"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Substation: {
        payload: Prisma.$SubstationPayload<ExtArgs>
        fields: Prisma.SubstationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SubstationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubstationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SubstationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubstationPayload>
          }
          findFirst: {
            args: Prisma.SubstationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubstationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SubstationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubstationPayload>
          }
          findMany: {
            args: Prisma.SubstationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubstationPayload>[]
          }
          create: {
            args: Prisma.SubstationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubstationPayload>
          }
          createMany: {
            args: Prisma.SubstationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SubstationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubstationPayload>[]
          }
          delete: {
            args: Prisma.SubstationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubstationPayload>
          }
          update: {
            args: Prisma.SubstationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubstationPayload>
          }
          deleteMany: {
            args: Prisma.SubstationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SubstationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SubstationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubstationPayload>[]
          }
          upsert: {
            args: Prisma.SubstationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubstationPayload>
          }
          aggregate: {
            args: Prisma.SubstationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSubstation>
          }
          groupBy: {
            args: Prisma.SubstationGroupByArgs<ExtArgs>
            result: $Utils.Optional<SubstationGroupByOutputType>[]
          }
          count: {
            args: Prisma.SubstationCountArgs<ExtArgs>
            result: $Utils.Optional<SubstationCountAggregateOutputType> | number
          }
        }
      }
      MeasurementSiang: {
        payload: Prisma.$MeasurementSiangPayload<ExtArgs>
        fields: Prisma.MeasurementSiangFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MeasurementSiangFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementSiangPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MeasurementSiangFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementSiangPayload>
          }
          findFirst: {
            args: Prisma.MeasurementSiangFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementSiangPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MeasurementSiangFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementSiangPayload>
          }
          findMany: {
            args: Prisma.MeasurementSiangFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementSiangPayload>[]
          }
          create: {
            args: Prisma.MeasurementSiangCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementSiangPayload>
          }
          createMany: {
            args: Prisma.MeasurementSiangCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MeasurementSiangCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementSiangPayload>[]
          }
          delete: {
            args: Prisma.MeasurementSiangDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementSiangPayload>
          }
          update: {
            args: Prisma.MeasurementSiangUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementSiangPayload>
          }
          deleteMany: {
            args: Prisma.MeasurementSiangDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MeasurementSiangUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MeasurementSiangUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementSiangPayload>[]
          }
          upsert: {
            args: Prisma.MeasurementSiangUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementSiangPayload>
          }
          aggregate: {
            args: Prisma.MeasurementSiangAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMeasurementSiang>
          }
          groupBy: {
            args: Prisma.MeasurementSiangGroupByArgs<ExtArgs>
            result: $Utils.Optional<MeasurementSiangGroupByOutputType>[]
          }
          count: {
            args: Prisma.MeasurementSiangCountArgs<ExtArgs>
            result: $Utils.Optional<MeasurementSiangCountAggregateOutputType> | number
          }
        }
      }
      MeasurementMalam: {
        payload: Prisma.$MeasurementMalamPayload<ExtArgs>
        fields: Prisma.MeasurementMalamFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MeasurementMalamFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementMalamPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MeasurementMalamFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementMalamPayload>
          }
          findFirst: {
            args: Prisma.MeasurementMalamFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementMalamPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MeasurementMalamFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementMalamPayload>
          }
          findMany: {
            args: Prisma.MeasurementMalamFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementMalamPayload>[]
          }
          create: {
            args: Prisma.MeasurementMalamCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementMalamPayload>
          }
          createMany: {
            args: Prisma.MeasurementMalamCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MeasurementMalamCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementMalamPayload>[]
          }
          delete: {
            args: Prisma.MeasurementMalamDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementMalamPayload>
          }
          update: {
            args: Prisma.MeasurementMalamUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementMalamPayload>
          }
          deleteMany: {
            args: Prisma.MeasurementMalamDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MeasurementMalamUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MeasurementMalamUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementMalamPayload>[]
          }
          upsert: {
            args: Prisma.MeasurementMalamUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MeasurementMalamPayload>
          }
          aggregate: {
            args: Prisma.MeasurementMalamAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMeasurementMalam>
          }
          groupBy: {
            args: Prisma.MeasurementMalamGroupByArgs<ExtArgs>
            result: $Utils.Optional<MeasurementMalamGroupByOutputType>[]
          }
          count: {
            args: Prisma.MeasurementMalamCountArgs<ExtArgs>
            result: $Utils.Optional<MeasurementMalamCountAggregateOutputType> | number
          }
        }
      }
      AdminUser: {
        payload: Prisma.$AdminUserPayload<ExtArgs>
        fields: Prisma.AdminUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AdminUserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AdminUserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>
          }
          findFirst: {
            args: Prisma.AdminUserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AdminUserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>
          }
          findMany: {
            args: Prisma.AdminUserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>[]
          }
          create: {
            args: Prisma.AdminUserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>
          }
          createMany: {
            args: Prisma.AdminUserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AdminUserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>[]
          }
          delete: {
            args: Prisma.AdminUserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>
          }
          update: {
            args: Prisma.AdminUserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>
          }
          deleteMany: {
            args: Prisma.AdminUserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AdminUserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AdminUserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>[]
          }
          upsert: {
            args: Prisma.AdminUserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminUserPayload>
          }
          aggregate: {
            args: Prisma.AdminUserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAdminUser>
          }
          groupBy: {
            args: Prisma.AdminUserGroupByArgs<ExtArgs>
            result: $Utils.Optional<AdminUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.AdminUserCountArgs<ExtArgs>
            result: $Utils.Optional<AdminUserCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    substation?: SubstationOmit
    measurementSiang?: MeasurementSiangOmit
    measurementMalam?: MeasurementMalamOmit
    adminUser?: AdminUserOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type SubstationCountOutputType
   */

  export type SubstationCountOutputType = {
    measurements_siang: number
    measurements_malam: number
  }

  export type SubstationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    measurements_siang?: boolean | SubstationCountOutputTypeCountMeasurements_siangArgs
    measurements_malam?: boolean | SubstationCountOutputTypeCountMeasurements_malamArgs
  }

  // Custom InputTypes
  /**
   * SubstationCountOutputType without action
   */
  export type SubstationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubstationCountOutputType
     */
    select?: SubstationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SubstationCountOutputType without action
   */
  export type SubstationCountOutputTypeCountMeasurements_siangArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MeasurementSiangWhereInput
  }

  /**
   * SubstationCountOutputType without action
   */
  export type SubstationCountOutputTypeCountMeasurements_malamArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MeasurementMalamWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Substation
   */

  export type AggregateSubstation = {
    _count: SubstationCountAggregateOutputType | null
    _avg: SubstationAvgAggregateOutputType | null
    _sum: SubstationSumAggregateOutputType | null
    _min: SubstationMinAggregateOutputType | null
    _max: SubstationMaxAggregateOutputType | null
  }

  export type SubstationAvgAggregateOutputType = {
    no: number | null
    is_active: number | null
    ugb: number | null
    latitude: number | null
    longitude: number | null
  }

  export type SubstationSumAggregateOutputType = {
    no: number | null
    is_active: number | null
    ugb: number | null
    latitude: number | null
    longitude: number | null
  }

  export type SubstationMinAggregateOutputType = {
    id: string | null
    no: number | null
    ulp: string | null
    noGardu: string | null
    namaLokasiGardu: string | null
    jenis: string | null
    merek: string | null
    daya: string | null
    tahun: string | null
    phasa: string | null
    tap_trafo_max_tap: string | null
    penyulang: string | null
    arahSequence: string | null
    tanggal: Date | null
    status: string | null
    lastUpdate: Date | null
    is_active: number | null
    ugb: number | null
    latitude: number | null
    longitude: number | null
  }

  export type SubstationMaxAggregateOutputType = {
    id: string | null
    no: number | null
    ulp: string | null
    noGardu: string | null
    namaLokasiGardu: string | null
    jenis: string | null
    merek: string | null
    daya: string | null
    tahun: string | null
    phasa: string | null
    tap_trafo_max_tap: string | null
    penyulang: string | null
    arahSequence: string | null
    tanggal: Date | null
    status: string | null
    lastUpdate: Date | null
    is_active: number | null
    ugb: number | null
    latitude: number | null
    longitude: number | null
  }

  export type SubstationCountAggregateOutputType = {
    id: number
    no: number
    ulp: number
    noGardu: number
    namaLokasiGardu: number
    jenis: number
    merek: number
    daya: number
    tahun: number
    phasa: number
    tap_trafo_max_tap: number
    penyulang: number
    arahSequence: number
    tanggal: number
    status: number
    lastUpdate: number
    is_active: number
    ugb: number
    latitude: number
    longitude: number
    _all: number
  }


  export type SubstationAvgAggregateInputType = {
    no?: true
    is_active?: true
    ugb?: true
    latitude?: true
    longitude?: true
  }

  export type SubstationSumAggregateInputType = {
    no?: true
    is_active?: true
    ugb?: true
    latitude?: true
    longitude?: true
  }

  export type SubstationMinAggregateInputType = {
    id?: true
    no?: true
    ulp?: true
    noGardu?: true
    namaLokasiGardu?: true
    jenis?: true
    merek?: true
    daya?: true
    tahun?: true
    phasa?: true
    tap_trafo_max_tap?: true
    penyulang?: true
    arahSequence?: true
    tanggal?: true
    status?: true
    lastUpdate?: true
    is_active?: true
    ugb?: true
    latitude?: true
    longitude?: true
  }

  export type SubstationMaxAggregateInputType = {
    id?: true
    no?: true
    ulp?: true
    noGardu?: true
    namaLokasiGardu?: true
    jenis?: true
    merek?: true
    daya?: true
    tahun?: true
    phasa?: true
    tap_trafo_max_tap?: true
    penyulang?: true
    arahSequence?: true
    tanggal?: true
    status?: true
    lastUpdate?: true
    is_active?: true
    ugb?: true
    latitude?: true
    longitude?: true
  }

  export type SubstationCountAggregateInputType = {
    id?: true
    no?: true
    ulp?: true
    noGardu?: true
    namaLokasiGardu?: true
    jenis?: true
    merek?: true
    daya?: true
    tahun?: true
    phasa?: true
    tap_trafo_max_tap?: true
    penyulang?: true
    arahSequence?: true
    tanggal?: true
    status?: true
    lastUpdate?: true
    is_active?: true
    ugb?: true
    latitude?: true
    longitude?: true
    _all?: true
  }

  export type SubstationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Substation to aggregate.
     */
    where?: SubstationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Substations to fetch.
     */
    orderBy?: SubstationOrderByWithRelationInput | SubstationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SubstationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Substations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Substations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Substations
    **/
    _count?: true | SubstationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SubstationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SubstationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SubstationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SubstationMaxAggregateInputType
  }

  export type GetSubstationAggregateType<T extends SubstationAggregateArgs> = {
        [P in keyof T & keyof AggregateSubstation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSubstation[P]>
      : GetScalarType<T[P], AggregateSubstation[P]>
  }




  export type SubstationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubstationWhereInput
    orderBy?: SubstationOrderByWithAggregationInput | SubstationOrderByWithAggregationInput[]
    by: SubstationScalarFieldEnum[] | SubstationScalarFieldEnum
    having?: SubstationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SubstationCountAggregateInputType | true
    _avg?: SubstationAvgAggregateInputType
    _sum?: SubstationSumAggregateInputType
    _min?: SubstationMinAggregateInputType
    _max?: SubstationMaxAggregateInputType
  }

  export type SubstationGroupByOutputType = {
    id: string
    no: number
    ulp: string
    noGardu: string
    namaLokasiGardu: string
    jenis: string
    merek: string
    daya: string
    tahun: string
    phasa: string
    tap_trafo_max_tap: string
    penyulang: string
    arahSequence: string
    tanggal: Date
    status: string
    lastUpdate: Date
    is_active: number
    ugb: number
    latitude: number | null
    longitude: number | null
    _count: SubstationCountAggregateOutputType | null
    _avg: SubstationAvgAggregateOutputType | null
    _sum: SubstationSumAggregateOutputType | null
    _min: SubstationMinAggregateOutputType | null
    _max: SubstationMaxAggregateOutputType | null
  }

  type GetSubstationGroupByPayload<T extends SubstationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SubstationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SubstationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SubstationGroupByOutputType[P]>
            : GetScalarType<T[P], SubstationGroupByOutputType[P]>
        }
      >
    >


  export type SubstationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    no?: boolean
    ulp?: boolean
    noGardu?: boolean
    namaLokasiGardu?: boolean
    jenis?: boolean
    merek?: boolean
    daya?: boolean
    tahun?: boolean
    phasa?: boolean
    tap_trafo_max_tap?: boolean
    penyulang?: boolean
    arahSequence?: boolean
    tanggal?: boolean
    status?: boolean
    lastUpdate?: boolean
    is_active?: boolean
    ugb?: boolean
    latitude?: boolean
    longitude?: boolean
    measurements_siang?: boolean | Substation$measurements_siangArgs<ExtArgs>
    measurements_malam?: boolean | Substation$measurements_malamArgs<ExtArgs>
    _count?: boolean | SubstationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["substation"]>

  export type SubstationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    no?: boolean
    ulp?: boolean
    noGardu?: boolean
    namaLokasiGardu?: boolean
    jenis?: boolean
    merek?: boolean
    daya?: boolean
    tahun?: boolean
    phasa?: boolean
    tap_trafo_max_tap?: boolean
    penyulang?: boolean
    arahSequence?: boolean
    tanggal?: boolean
    status?: boolean
    lastUpdate?: boolean
    is_active?: boolean
    ugb?: boolean
    latitude?: boolean
    longitude?: boolean
  }, ExtArgs["result"]["substation"]>

  export type SubstationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    no?: boolean
    ulp?: boolean
    noGardu?: boolean
    namaLokasiGardu?: boolean
    jenis?: boolean
    merek?: boolean
    daya?: boolean
    tahun?: boolean
    phasa?: boolean
    tap_trafo_max_tap?: boolean
    penyulang?: boolean
    arahSequence?: boolean
    tanggal?: boolean
    status?: boolean
    lastUpdate?: boolean
    is_active?: boolean
    ugb?: boolean
    latitude?: boolean
    longitude?: boolean
  }, ExtArgs["result"]["substation"]>

  export type SubstationSelectScalar = {
    id?: boolean
    no?: boolean
    ulp?: boolean
    noGardu?: boolean
    namaLokasiGardu?: boolean
    jenis?: boolean
    merek?: boolean
    daya?: boolean
    tahun?: boolean
    phasa?: boolean
    tap_trafo_max_tap?: boolean
    penyulang?: boolean
    arahSequence?: boolean
    tanggal?: boolean
    status?: boolean
    lastUpdate?: boolean
    is_active?: boolean
    ugb?: boolean
    latitude?: boolean
    longitude?: boolean
  }

  export type SubstationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "no" | "ulp" | "noGardu" | "namaLokasiGardu" | "jenis" | "merek" | "daya" | "tahun" | "phasa" | "tap_trafo_max_tap" | "penyulang" | "arahSequence" | "tanggal" | "status" | "lastUpdate" | "is_active" | "ugb" | "latitude" | "longitude", ExtArgs["result"]["substation"]>
  export type SubstationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    measurements_siang?: boolean | Substation$measurements_siangArgs<ExtArgs>
    measurements_malam?: boolean | Substation$measurements_malamArgs<ExtArgs>
    _count?: boolean | SubstationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SubstationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SubstationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SubstationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Substation"
    objects: {
      measurements_siang: Prisma.$MeasurementSiangPayload<ExtArgs>[]
      measurements_malam: Prisma.$MeasurementMalamPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      no: number
      ulp: string
      noGardu: string
      namaLokasiGardu: string
      jenis: string
      merek: string
      daya: string
      tahun: string
      phasa: string
      tap_trafo_max_tap: string
      penyulang: string
      arahSequence: string
      tanggal: Date
      status: string
      lastUpdate: Date
      is_active: number
      ugb: number
      latitude: number | null
      longitude: number | null
    }, ExtArgs["result"]["substation"]>
    composites: {}
  }

  type SubstationGetPayload<S extends boolean | null | undefined | SubstationDefaultArgs> = $Result.GetResult<Prisma.$SubstationPayload, S>

  type SubstationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SubstationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SubstationCountAggregateInputType | true
    }

  export interface SubstationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Substation'], meta: { name: 'Substation' } }
    /**
     * Find zero or one Substation that matches the filter.
     * @param {SubstationFindUniqueArgs} args - Arguments to find a Substation
     * @example
     * // Get one Substation
     * const substation = await prisma.substation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SubstationFindUniqueArgs>(args: SelectSubset<T, SubstationFindUniqueArgs<ExtArgs>>): Prisma__SubstationClient<$Result.GetResult<Prisma.$SubstationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Substation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SubstationFindUniqueOrThrowArgs} args - Arguments to find a Substation
     * @example
     * // Get one Substation
     * const substation = await prisma.substation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SubstationFindUniqueOrThrowArgs>(args: SelectSubset<T, SubstationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SubstationClient<$Result.GetResult<Prisma.$SubstationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Substation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubstationFindFirstArgs} args - Arguments to find a Substation
     * @example
     * // Get one Substation
     * const substation = await prisma.substation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SubstationFindFirstArgs>(args?: SelectSubset<T, SubstationFindFirstArgs<ExtArgs>>): Prisma__SubstationClient<$Result.GetResult<Prisma.$SubstationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Substation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubstationFindFirstOrThrowArgs} args - Arguments to find a Substation
     * @example
     * // Get one Substation
     * const substation = await prisma.substation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SubstationFindFirstOrThrowArgs>(args?: SelectSubset<T, SubstationFindFirstOrThrowArgs<ExtArgs>>): Prisma__SubstationClient<$Result.GetResult<Prisma.$SubstationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Substations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubstationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Substations
     * const substations = await prisma.substation.findMany()
     * 
     * // Get first 10 Substations
     * const substations = await prisma.substation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const substationWithIdOnly = await prisma.substation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SubstationFindManyArgs>(args?: SelectSubset<T, SubstationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubstationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Substation.
     * @param {SubstationCreateArgs} args - Arguments to create a Substation.
     * @example
     * // Create one Substation
     * const Substation = await prisma.substation.create({
     *   data: {
     *     // ... data to create a Substation
     *   }
     * })
     * 
     */
    create<T extends SubstationCreateArgs>(args: SelectSubset<T, SubstationCreateArgs<ExtArgs>>): Prisma__SubstationClient<$Result.GetResult<Prisma.$SubstationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Substations.
     * @param {SubstationCreateManyArgs} args - Arguments to create many Substations.
     * @example
     * // Create many Substations
     * const substation = await prisma.substation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SubstationCreateManyArgs>(args?: SelectSubset<T, SubstationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Substations and returns the data saved in the database.
     * @param {SubstationCreateManyAndReturnArgs} args - Arguments to create many Substations.
     * @example
     * // Create many Substations
     * const substation = await prisma.substation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Substations and only return the `id`
     * const substationWithIdOnly = await prisma.substation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SubstationCreateManyAndReturnArgs>(args?: SelectSubset<T, SubstationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubstationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Substation.
     * @param {SubstationDeleteArgs} args - Arguments to delete one Substation.
     * @example
     * // Delete one Substation
     * const Substation = await prisma.substation.delete({
     *   where: {
     *     // ... filter to delete one Substation
     *   }
     * })
     * 
     */
    delete<T extends SubstationDeleteArgs>(args: SelectSubset<T, SubstationDeleteArgs<ExtArgs>>): Prisma__SubstationClient<$Result.GetResult<Prisma.$SubstationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Substation.
     * @param {SubstationUpdateArgs} args - Arguments to update one Substation.
     * @example
     * // Update one Substation
     * const substation = await prisma.substation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SubstationUpdateArgs>(args: SelectSubset<T, SubstationUpdateArgs<ExtArgs>>): Prisma__SubstationClient<$Result.GetResult<Prisma.$SubstationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Substations.
     * @param {SubstationDeleteManyArgs} args - Arguments to filter Substations to delete.
     * @example
     * // Delete a few Substations
     * const { count } = await prisma.substation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SubstationDeleteManyArgs>(args?: SelectSubset<T, SubstationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Substations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubstationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Substations
     * const substation = await prisma.substation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SubstationUpdateManyArgs>(args: SelectSubset<T, SubstationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Substations and returns the data updated in the database.
     * @param {SubstationUpdateManyAndReturnArgs} args - Arguments to update many Substations.
     * @example
     * // Update many Substations
     * const substation = await prisma.substation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Substations and only return the `id`
     * const substationWithIdOnly = await prisma.substation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SubstationUpdateManyAndReturnArgs>(args: SelectSubset<T, SubstationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubstationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Substation.
     * @param {SubstationUpsertArgs} args - Arguments to update or create a Substation.
     * @example
     * // Update or create a Substation
     * const substation = await prisma.substation.upsert({
     *   create: {
     *     // ... data to create a Substation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Substation we want to update
     *   }
     * })
     */
    upsert<T extends SubstationUpsertArgs>(args: SelectSubset<T, SubstationUpsertArgs<ExtArgs>>): Prisma__SubstationClient<$Result.GetResult<Prisma.$SubstationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Substations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubstationCountArgs} args - Arguments to filter Substations to count.
     * @example
     * // Count the number of Substations
     * const count = await prisma.substation.count({
     *   where: {
     *     // ... the filter for the Substations we want to count
     *   }
     * })
    **/
    count<T extends SubstationCountArgs>(
      args?: Subset<T, SubstationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SubstationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Substation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubstationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SubstationAggregateArgs>(args: Subset<T, SubstationAggregateArgs>): Prisma.PrismaPromise<GetSubstationAggregateType<T>>

    /**
     * Group by Substation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubstationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SubstationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SubstationGroupByArgs['orderBy'] }
        : { orderBy?: SubstationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SubstationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSubstationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Substation model
   */
  readonly fields: SubstationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Substation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SubstationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    measurements_siang<T extends Substation$measurements_siangArgs<ExtArgs> = {}>(args?: Subset<T, Substation$measurements_siangArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MeasurementSiangPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    measurements_malam<T extends Substation$measurements_malamArgs<ExtArgs> = {}>(args?: Subset<T, Substation$measurements_malamArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MeasurementMalamPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Substation model
   */
  interface SubstationFieldRefs {
    readonly id: FieldRef<"Substation", 'String'>
    readonly no: FieldRef<"Substation", 'Int'>
    readonly ulp: FieldRef<"Substation", 'String'>
    readonly noGardu: FieldRef<"Substation", 'String'>
    readonly namaLokasiGardu: FieldRef<"Substation", 'String'>
    readonly jenis: FieldRef<"Substation", 'String'>
    readonly merek: FieldRef<"Substation", 'String'>
    readonly daya: FieldRef<"Substation", 'String'>
    readonly tahun: FieldRef<"Substation", 'String'>
    readonly phasa: FieldRef<"Substation", 'String'>
    readonly tap_trafo_max_tap: FieldRef<"Substation", 'String'>
    readonly penyulang: FieldRef<"Substation", 'String'>
    readonly arahSequence: FieldRef<"Substation", 'String'>
    readonly tanggal: FieldRef<"Substation", 'DateTime'>
    readonly status: FieldRef<"Substation", 'String'>
    readonly lastUpdate: FieldRef<"Substation", 'DateTime'>
    readonly is_active: FieldRef<"Substation", 'Int'>
    readonly ugb: FieldRef<"Substation", 'Int'>
    readonly latitude: FieldRef<"Substation", 'Float'>
    readonly longitude: FieldRef<"Substation", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * Substation findUnique
   */
  export type SubstationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Substation
     */
    select?: SubstationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Substation
     */
    omit?: SubstationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubstationInclude<ExtArgs> | null
    /**
     * Filter, which Substation to fetch.
     */
    where: SubstationWhereUniqueInput
  }

  /**
   * Substation findUniqueOrThrow
   */
  export type SubstationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Substation
     */
    select?: SubstationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Substation
     */
    omit?: SubstationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubstationInclude<ExtArgs> | null
    /**
     * Filter, which Substation to fetch.
     */
    where: SubstationWhereUniqueInput
  }

  /**
   * Substation findFirst
   */
  export type SubstationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Substation
     */
    select?: SubstationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Substation
     */
    omit?: SubstationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubstationInclude<ExtArgs> | null
    /**
     * Filter, which Substation to fetch.
     */
    where?: SubstationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Substations to fetch.
     */
    orderBy?: SubstationOrderByWithRelationInput | SubstationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Substations.
     */
    cursor?: SubstationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Substations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Substations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Substations.
     */
    distinct?: SubstationScalarFieldEnum | SubstationScalarFieldEnum[]
  }

  /**
   * Substation findFirstOrThrow
   */
  export type SubstationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Substation
     */
    select?: SubstationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Substation
     */
    omit?: SubstationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubstationInclude<ExtArgs> | null
    /**
     * Filter, which Substation to fetch.
     */
    where?: SubstationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Substations to fetch.
     */
    orderBy?: SubstationOrderByWithRelationInput | SubstationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Substations.
     */
    cursor?: SubstationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Substations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Substations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Substations.
     */
    distinct?: SubstationScalarFieldEnum | SubstationScalarFieldEnum[]
  }

  /**
   * Substation findMany
   */
  export type SubstationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Substation
     */
    select?: SubstationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Substation
     */
    omit?: SubstationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubstationInclude<ExtArgs> | null
    /**
     * Filter, which Substations to fetch.
     */
    where?: SubstationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Substations to fetch.
     */
    orderBy?: SubstationOrderByWithRelationInput | SubstationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Substations.
     */
    cursor?: SubstationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Substations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Substations.
     */
    skip?: number
    distinct?: SubstationScalarFieldEnum | SubstationScalarFieldEnum[]
  }

  /**
   * Substation create
   */
  export type SubstationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Substation
     */
    select?: SubstationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Substation
     */
    omit?: SubstationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubstationInclude<ExtArgs> | null
    /**
     * The data needed to create a Substation.
     */
    data: XOR<SubstationCreateInput, SubstationUncheckedCreateInput>
  }

  /**
   * Substation createMany
   */
  export type SubstationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Substations.
     */
    data: SubstationCreateManyInput | SubstationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Substation createManyAndReturn
   */
  export type SubstationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Substation
     */
    select?: SubstationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Substation
     */
    omit?: SubstationOmit<ExtArgs> | null
    /**
     * The data used to create many Substations.
     */
    data: SubstationCreateManyInput | SubstationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Substation update
   */
  export type SubstationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Substation
     */
    select?: SubstationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Substation
     */
    omit?: SubstationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubstationInclude<ExtArgs> | null
    /**
     * The data needed to update a Substation.
     */
    data: XOR<SubstationUpdateInput, SubstationUncheckedUpdateInput>
    /**
     * Choose, which Substation to update.
     */
    where: SubstationWhereUniqueInput
  }

  /**
   * Substation updateMany
   */
  export type SubstationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Substations.
     */
    data: XOR<SubstationUpdateManyMutationInput, SubstationUncheckedUpdateManyInput>
    /**
     * Filter which Substations to update
     */
    where?: SubstationWhereInput
    /**
     * Limit how many Substations to update.
     */
    limit?: number
  }

  /**
   * Substation updateManyAndReturn
   */
  export type SubstationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Substation
     */
    select?: SubstationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Substation
     */
    omit?: SubstationOmit<ExtArgs> | null
    /**
     * The data used to update Substations.
     */
    data: XOR<SubstationUpdateManyMutationInput, SubstationUncheckedUpdateManyInput>
    /**
     * Filter which Substations to update
     */
    where?: SubstationWhereInput
    /**
     * Limit how many Substations to update.
     */
    limit?: number
  }

  /**
   * Substation upsert
   */
  export type SubstationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Substation
     */
    select?: SubstationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Substation
     */
    omit?: SubstationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubstationInclude<ExtArgs> | null
    /**
     * The filter to search for the Substation to update in case it exists.
     */
    where: SubstationWhereUniqueInput
    /**
     * In case the Substation found by the `where` argument doesn't exist, create a new Substation with this data.
     */
    create: XOR<SubstationCreateInput, SubstationUncheckedCreateInput>
    /**
     * In case the Substation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SubstationUpdateInput, SubstationUncheckedUpdateInput>
  }

  /**
   * Substation delete
   */
  export type SubstationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Substation
     */
    select?: SubstationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Substation
     */
    omit?: SubstationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubstationInclude<ExtArgs> | null
    /**
     * Filter which Substation to delete.
     */
    where: SubstationWhereUniqueInput
  }

  /**
   * Substation deleteMany
   */
  export type SubstationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Substations to delete
     */
    where?: SubstationWhereInput
    /**
     * Limit how many Substations to delete.
     */
    limit?: number
  }

  /**
   * Substation.measurements_siang
   */
  export type Substation$measurements_siangArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementSiang
     */
    select?: MeasurementSiangSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementSiang
     */
    omit?: MeasurementSiangOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementSiangInclude<ExtArgs> | null
    where?: MeasurementSiangWhereInput
    orderBy?: MeasurementSiangOrderByWithRelationInput | MeasurementSiangOrderByWithRelationInput[]
    cursor?: MeasurementSiangWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MeasurementSiangScalarFieldEnum | MeasurementSiangScalarFieldEnum[]
  }

  /**
   * Substation.measurements_malam
   */
  export type Substation$measurements_malamArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementMalam
     */
    select?: MeasurementMalamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementMalam
     */
    omit?: MeasurementMalamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementMalamInclude<ExtArgs> | null
    where?: MeasurementMalamWhereInput
    orderBy?: MeasurementMalamOrderByWithRelationInput | MeasurementMalamOrderByWithRelationInput[]
    cursor?: MeasurementMalamWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MeasurementMalamScalarFieldEnum | MeasurementMalamScalarFieldEnum[]
  }

  /**
   * Substation without action
   */
  export type SubstationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Substation
     */
    select?: SubstationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Substation
     */
    omit?: SubstationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SubstationInclude<ExtArgs> | null
  }


  /**
   * Model MeasurementSiang
   */

  export type AggregateMeasurementSiang = {
    _count: MeasurementSiangCountAggregateOutputType | null
    _avg: MeasurementSiangAvgAggregateOutputType | null
    _sum: MeasurementSiangSumAggregateOutputType | null
    _min: MeasurementSiangMinAggregateOutputType | null
    _max: MeasurementSiangMaxAggregateOutputType | null
  }

  export type MeasurementSiangAvgAggregateOutputType = {
    id: number | null
    r: number | null
    s: number | null
    t: number | null
    n: number | null
    rn: number | null
    sn: number | null
    tn: number | null
    pp: number | null
    pn: number | null
    rata2: number | null
    kva: number | null
    persen: number | null
    unbalanced: number | null
  }

  export type MeasurementSiangSumAggregateOutputType = {
    id: number | null
    r: number | null
    s: number | null
    t: number | null
    n: number | null
    rn: number | null
    sn: number | null
    tn: number | null
    pp: number | null
    pn: number | null
    rata2: number | null
    kva: number | null
    persen: number | null
    unbalanced: number | null
  }

  export type MeasurementSiangMinAggregateOutputType = {
    id: number | null
    substationId: string | null
    month: string | null
    r: number | null
    s: number | null
    t: number | null
    n: number | null
    rn: number | null
    sn: number | null
    tn: number | null
    pp: number | null
    pn: number | null
    row_name: string | null
    rata2: number | null
    kva: number | null
    persen: number | null
    unbalanced: number | null
    lastUpdate: Date | null
  }

  export type MeasurementSiangMaxAggregateOutputType = {
    id: number | null
    substationId: string | null
    month: string | null
    r: number | null
    s: number | null
    t: number | null
    n: number | null
    rn: number | null
    sn: number | null
    tn: number | null
    pp: number | null
    pn: number | null
    row_name: string | null
    rata2: number | null
    kva: number | null
    persen: number | null
    unbalanced: number | null
    lastUpdate: Date | null
  }

  export type MeasurementSiangCountAggregateOutputType = {
    id: number
    substationId: number
    month: number
    r: number
    s: number
    t: number
    n: number
    rn: number
    sn: number
    tn: number
    pp: number
    pn: number
    row_name: number
    rata2: number
    kva: number
    persen: number
    unbalanced: number
    lastUpdate: number
    _all: number
  }


  export type MeasurementSiangAvgAggregateInputType = {
    id?: true
    r?: true
    s?: true
    t?: true
    n?: true
    rn?: true
    sn?: true
    tn?: true
    pp?: true
    pn?: true
    rata2?: true
    kva?: true
    persen?: true
    unbalanced?: true
  }

  export type MeasurementSiangSumAggregateInputType = {
    id?: true
    r?: true
    s?: true
    t?: true
    n?: true
    rn?: true
    sn?: true
    tn?: true
    pp?: true
    pn?: true
    rata2?: true
    kva?: true
    persen?: true
    unbalanced?: true
  }

  export type MeasurementSiangMinAggregateInputType = {
    id?: true
    substationId?: true
    month?: true
    r?: true
    s?: true
    t?: true
    n?: true
    rn?: true
    sn?: true
    tn?: true
    pp?: true
    pn?: true
    row_name?: true
    rata2?: true
    kva?: true
    persen?: true
    unbalanced?: true
    lastUpdate?: true
  }

  export type MeasurementSiangMaxAggregateInputType = {
    id?: true
    substationId?: true
    month?: true
    r?: true
    s?: true
    t?: true
    n?: true
    rn?: true
    sn?: true
    tn?: true
    pp?: true
    pn?: true
    row_name?: true
    rata2?: true
    kva?: true
    persen?: true
    unbalanced?: true
    lastUpdate?: true
  }

  export type MeasurementSiangCountAggregateInputType = {
    id?: true
    substationId?: true
    month?: true
    r?: true
    s?: true
    t?: true
    n?: true
    rn?: true
    sn?: true
    tn?: true
    pp?: true
    pn?: true
    row_name?: true
    rata2?: true
    kva?: true
    persen?: true
    unbalanced?: true
    lastUpdate?: true
    _all?: true
  }

  export type MeasurementSiangAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MeasurementSiang to aggregate.
     */
    where?: MeasurementSiangWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MeasurementSiangs to fetch.
     */
    orderBy?: MeasurementSiangOrderByWithRelationInput | MeasurementSiangOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MeasurementSiangWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MeasurementSiangs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MeasurementSiangs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MeasurementSiangs
    **/
    _count?: true | MeasurementSiangCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MeasurementSiangAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MeasurementSiangSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MeasurementSiangMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MeasurementSiangMaxAggregateInputType
  }

  export type GetMeasurementSiangAggregateType<T extends MeasurementSiangAggregateArgs> = {
        [P in keyof T & keyof AggregateMeasurementSiang]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMeasurementSiang[P]>
      : GetScalarType<T[P], AggregateMeasurementSiang[P]>
  }




  export type MeasurementSiangGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MeasurementSiangWhereInput
    orderBy?: MeasurementSiangOrderByWithAggregationInput | MeasurementSiangOrderByWithAggregationInput[]
    by: MeasurementSiangScalarFieldEnum[] | MeasurementSiangScalarFieldEnum
    having?: MeasurementSiangScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MeasurementSiangCountAggregateInputType | true
    _avg?: MeasurementSiangAvgAggregateInputType
    _sum?: MeasurementSiangSumAggregateInputType
    _min?: MeasurementSiangMinAggregateInputType
    _max?: MeasurementSiangMaxAggregateInputType
  }

  export type MeasurementSiangGroupByOutputType = {
    id: number
    substationId: string
    month: string
    r: number
    s: number
    t: number
    n: number
    rn: number
    sn: number
    tn: number
    pp: number
    pn: number
    row_name: string
    rata2: number | null
    kva: number | null
    persen: number | null
    unbalanced: number | null
    lastUpdate: Date
    _count: MeasurementSiangCountAggregateOutputType | null
    _avg: MeasurementSiangAvgAggregateOutputType | null
    _sum: MeasurementSiangSumAggregateOutputType | null
    _min: MeasurementSiangMinAggregateOutputType | null
    _max: MeasurementSiangMaxAggregateOutputType | null
  }

  type GetMeasurementSiangGroupByPayload<T extends MeasurementSiangGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MeasurementSiangGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MeasurementSiangGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MeasurementSiangGroupByOutputType[P]>
            : GetScalarType<T[P], MeasurementSiangGroupByOutputType[P]>
        }
      >
    >


  export type MeasurementSiangSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    substationId?: boolean
    month?: boolean
    r?: boolean
    s?: boolean
    t?: boolean
    n?: boolean
    rn?: boolean
    sn?: boolean
    tn?: boolean
    pp?: boolean
    pn?: boolean
    row_name?: boolean
    rata2?: boolean
    kva?: boolean
    persen?: boolean
    unbalanced?: boolean
    lastUpdate?: boolean
    substation?: boolean | SubstationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["measurementSiang"]>

  export type MeasurementSiangSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    substationId?: boolean
    month?: boolean
    r?: boolean
    s?: boolean
    t?: boolean
    n?: boolean
    rn?: boolean
    sn?: boolean
    tn?: boolean
    pp?: boolean
    pn?: boolean
    row_name?: boolean
    rata2?: boolean
    kva?: boolean
    persen?: boolean
    unbalanced?: boolean
    lastUpdate?: boolean
    substation?: boolean | SubstationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["measurementSiang"]>

  export type MeasurementSiangSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    substationId?: boolean
    month?: boolean
    r?: boolean
    s?: boolean
    t?: boolean
    n?: boolean
    rn?: boolean
    sn?: boolean
    tn?: boolean
    pp?: boolean
    pn?: boolean
    row_name?: boolean
    rata2?: boolean
    kva?: boolean
    persen?: boolean
    unbalanced?: boolean
    lastUpdate?: boolean
    substation?: boolean | SubstationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["measurementSiang"]>

  export type MeasurementSiangSelectScalar = {
    id?: boolean
    substationId?: boolean
    month?: boolean
    r?: boolean
    s?: boolean
    t?: boolean
    n?: boolean
    rn?: boolean
    sn?: boolean
    tn?: boolean
    pp?: boolean
    pn?: boolean
    row_name?: boolean
    rata2?: boolean
    kva?: boolean
    persen?: boolean
    unbalanced?: boolean
    lastUpdate?: boolean
  }

  export type MeasurementSiangOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "substationId" | "month" | "r" | "s" | "t" | "n" | "rn" | "sn" | "tn" | "pp" | "pn" | "row_name" | "rata2" | "kva" | "persen" | "unbalanced" | "lastUpdate", ExtArgs["result"]["measurementSiang"]>
  export type MeasurementSiangInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    substation?: boolean | SubstationDefaultArgs<ExtArgs>
  }
  export type MeasurementSiangIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    substation?: boolean | SubstationDefaultArgs<ExtArgs>
  }
  export type MeasurementSiangIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    substation?: boolean | SubstationDefaultArgs<ExtArgs>
  }

  export type $MeasurementSiangPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MeasurementSiang"
    objects: {
      substation: Prisma.$SubstationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      substationId: string
      month: string
      r: number
      s: number
      t: number
      n: number
      rn: number
      sn: number
      tn: number
      pp: number
      pn: number
      row_name: string
      rata2: number | null
      kva: number | null
      persen: number | null
      unbalanced: number | null
      lastUpdate: Date
    }, ExtArgs["result"]["measurementSiang"]>
    composites: {}
  }

  type MeasurementSiangGetPayload<S extends boolean | null | undefined | MeasurementSiangDefaultArgs> = $Result.GetResult<Prisma.$MeasurementSiangPayload, S>

  type MeasurementSiangCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MeasurementSiangFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MeasurementSiangCountAggregateInputType | true
    }

  export interface MeasurementSiangDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MeasurementSiang'], meta: { name: 'MeasurementSiang' } }
    /**
     * Find zero or one MeasurementSiang that matches the filter.
     * @param {MeasurementSiangFindUniqueArgs} args - Arguments to find a MeasurementSiang
     * @example
     * // Get one MeasurementSiang
     * const measurementSiang = await prisma.measurementSiang.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MeasurementSiangFindUniqueArgs>(args: SelectSubset<T, MeasurementSiangFindUniqueArgs<ExtArgs>>): Prisma__MeasurementSiangClient<$Result.GetResult<Prisma.$MeasurementSiangPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MeasurementSiang that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MeasurementSiangFindUniqueOrThrowArgs} args - Arguments to find a MeasurementSiang
     * @example
     * // Get one MeasurementSiang
     * const measurementSiang = await prisma.measurementSiang.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MeasurementSiangFindUniqueOrThrowArgs>(args: SelectSubset<T, MeasurementSiangFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MeasurementSiangClient<$Result.GetResult<Prisma.$MeasurementSiangPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MeasurementSiang that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementSiangFindFirstArgs} args - Arguments to find a MeasurementSiang
     * @example
     * // Get one MeasurementSiang
     * const measurementSiang = await prisma.measurementSiang.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MeasurementSiangFindFirstArgs>(args?: SelectSubset<T, MeasurementSiangFindFirstArgs<ExtArgs>>): Prisma__MeasurementSiangClient<$Result.GetResult<Prisma.$MeasurementSiangPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MeasurementSiang that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementSiangFindFirstOrThrowArgs} args - Arguments to find a MeasurementSiang
     * @example
     * // Get one MeasurementSiang
     * const measurementSiang = await prisma.measurementSiang.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MeasurementSiangFindFirstOrThrowArgs>(args?: SelectSubset<T, MeasurementSiangFindFirstOrThrowArgs<ExtArgs>>): Prisma__MeasurementSiangClient<$Result.GetResult<Prisma.$MeasurementSiangPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MeasurementSiangs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementSiangFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MeasurementSiangs
     * const measurementSiangs = await prisma.measurementSiang.findMany()
     * 
     * // Get first 10 MeasurementSiangs
     * const measurementSiangs = await prisma.measurementSiang.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const measurementSiangWithIdOnly = await prisma.measurementSiang.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MeasurementSiangFindManyArgs>(args?: SelectSubset<T, MeasurementSiangFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MeasurementSiangPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MeasurementSiang.
     * @param {MeasurementSiangCreateArgs} args - Arguments to create a MeasurementSiang.
     * @example
     * // Create one MeasurementSiang
     * const MeasurementSiang = await prisma.measurementSiang.create({
     *   data: {
     *     // ... data to create a MeasurementSiang
     *   }
     * })
     * 
     */
    create<T extends MeasurementSiangCreateArgs>(args: SelectSubset<T, MeasurementSiangCreateArgs<ExtArgs>>): Prisma__MeasurementSiangClient<$Result.GetResult<Prisma.$MeasurementSiangPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MeasurementSiangs.
     * @param {MeasurementSiangCreateManyArgs} args - Arguments to create many MeasurementSiangs.
     * @example
     * // Create many MeasurementSiangs
     * const measurementSiang = await prisma.measurementSiang.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MeasurementSiangCreateManyArgs>(args?: SelectSubset<T, MeasurementSiangCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MeasurementSiangs and returns the data saved in the database.
     * @param {MeasurementSiangCreateManyAndReturnArgs} args - Arguments to create many MeasurementSiangs.
     * @example
     * // Create many MeasurementSiangs
     * const measurementSiang = await prisma.measurementSiang.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MeasurementSiangs and only return the `id`
     * const measurementSiangWithIdOnly = await prisma.measurementSiang.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MeasurementSiangCreateManyAndReturnArgs>(args?: SelectSubset<T, MeasurementSiangCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MeasurementSiangPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MeasurementSiang.
     * @param {MeasurementSiangDeleteArgs} args - Arguments to delete one MeasurementSiang.
     * @example
     * // Delete one MeasurementSiang
     * const MeasurementSiang = await prisma.measurementSiang.delete({
     *   where: {
     *     // ... filter to delete one MeasurementSiang
     *   }
     * })
     * 
     */
    delete<T extends MeasurementSiangDeleteArgs>(args: SelectSubset<T, MeasurementSiangDeleteArgs<ExtArgs>>): Prisma__MeasurementSiangClient<$Result.GetResult<Prisma.$MeasurementSiangPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MeasurementSiang.
     * @param {MeasurementSiangUpdateArgs} args - Arguments to update one MeasurementSiang.
     * @example
     * // Update one MeasurementSiang
     * const measurementSiang = await prisma.measurementSiang.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MeasurementSiangUpdateArgs>(args: SelectSubset<T, MeasurementSiangUpdateArgs<ExtArgs>>): Prisma__MeasurementSiangClient<$Result.GetResult<Prisma.$MeasurementSiangPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MeasurementSiangs.
     * @param {MeasurementSiangDeleteManyArgs} args - Arguments to filter MeasurementSiangs to delete.
     * @example
     * // Delete a few MeasurementSiangs
     * const { count } = await prisma.measurementSiang.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MeasurementSiangDeleteManyArgs>(args?: SelectSubset<T, MeasurementSiangDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MeasurementSiangs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementSiangUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MeasurementSiangs
     * const measurementSiang = await prisma.measurementSiang.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MeasurementSiangUpdateManyArgs>(args: SelectSubset<T, MeasurementSiangUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MeasurementSiangs and returns the data updated in the database.
     * @param {MeasurementSiangUpdateManyAndReturnArgs} args - Arguments to update many MeasurementSiangs.
     * @example
     * // Update many MeasurementSiangs
     * const measurementSiang = await prisma.measurementSiang.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MeasurementSiangs and only return the `id`
     * const measurementSiangWithIdOnly = await prisma.measurementSiang.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MeasurementSiangUpdateManyAndReturnArgs>(args: SelectSubset<T, MeasurementSiangUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MeasurementSiangPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MeasurementSiang.
     * @param {MeasurementSiangUpsertArgs} args - Arguments to update or create a MeasurementSiang.
     * @example
     * // Update or create a MeasurementSiang
     * const measurementSiang = await prisma.measurementSiang.upsert({
     *   create: {
     *     // ... data to create a MeasurementSiang
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MeasurementSiang we want to update
     *   }
     * })
     */
    upsert<T extends MeasurementSiangUpsertArgs>(args: SelectSubset<T, MeasurementSiangUpsertArgs<ExtArgs>>): Prisma__MeasurementSiangClient<$Result.GetResult<Prisma.$MeasurementSiangPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MeasurementSiangs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementSiangCountArgs} args - Arguments to filter MeasurementSiangs to count.
     * @example
     * // Count the number of MeasurementSiangs
     * const count = await prisma.measurementSiang.count({
     *   where: {
     *     // ... the filter for the MeasurementSiangs we want to count
     *   }
     * })
    **/
    count<T extends MeasurementSiangCountArgs>(
      args?: Subset<T, MeasurementSiangCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MeasurementSiangCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MeasurementSiang.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementSiangAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MeasurementSiangAggregateArgs>(args: Subset<T, MeasurementSiangAggregateArgs>): Prisma.PrismaPromise<GetMeasurementSiangAggregateType<T>>

    /**
     * Group by MeasurementSiang.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementSiangGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MeasurementSiangGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MeasurementSiangGroupByArgs['orderBy'] }
        : { orderBy?: MeasurementSiangGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MeasurementSiangGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMeasurementSiangGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MeasurementSiang model
   */
  readonly fields: MeasurementSiangFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MeasurementSiang.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MeasurementSiangClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    substation<T extends SubstationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SubstationDefaultArgs<ExtArgs>>): Prisma__SubstationClient<$Result.GetResult<Prisma.$SubstationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MeasurementSiang model
   */
  interface MeasurementSiangFieldRefs {
    readonly id: FieldRef<"MeasurementSiang", 'Int'>
    readonly substationId: FieldRef<"MeasurementSiang", 'String'>
    readonly month: FieldRef<"MeasurementSiang", 'String'>
    readonly r: FieldRef<"MeasurementSiang", 'Float'>
    readonly s: FieldRef<"MeasurementSiang", 'Float'>
    readonly t: FieldRef<"MeasurementSiang", 'Float'>
    readonly n: FieldRef<"MeasurementSiang", 'Float'>
    readonly rn: FieldRef<"MeasurementSiang", 'Float'>
    readonly sn: FieldRef<"MeasurementSiang", 'Float'>
    readonly tn: FieldRef<"MeasurementSiang", 'Float'>
    readonly pp: FieldRef<"MeasurementSiang", 'Float'>
    readonly pn: FieldRef<"MeasurementSiang", 'Float'>
    readonly row_name: FieldRef<"MeasurementSiang", 'String'>
    readonly rata2: FieldRef<"MeasurementSiang", 'Float'>
    readonly kva: FieldRef<"MeasurementSiang", 'Float'>
    readonly persen: FieldRef<"MeasurementSiang", 'Float'>
    readonly unbalanced: FieldRef<"MeasurementSiang", 'Float'>
    readonly lastUpdate: FieldRef<"MeasurementSiang", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MeasurementSiang findUnique
   */
  export type MeasurementSiangFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementSiang
     */
    select?: MeasurementSiangSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementSiang
     */
    omit?: MeasurementSiangOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementSiangInclude<ExtArgs> | null
    /**
     * Filter, which MeasurementSiang to fetch.
     */
    where: MeasurementSiangWhereUniqueInput
  }

  /**
   * MeasurementSiang findUniqueOrThrow
   */
  export type MeasurementSiangFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementSiang
     */
    select?: MeasurementSiangSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementSiang
     */
    omit?: MeasurementSiangOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementSiangInclude<ExtArgs> | null
    /**
     * Filter, which MeasurementSiang to fetch.
     */
    where: MeasurementSiangWhereUniqueInput
  }

  /**
   * MeasurementSiang findFirst
   */
  export type MeasurementSiangFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementSiang
     */
    select?: MeasurementSiangSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementSiang
     */
    omit?: MeasurementSiangOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementSiangInclude<ExtArgs> | null
    /**
     * Filter, which MeasurementSiang to fetch.
     */
    where?: MeasurementSiangWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MeasurementSiangs to fetch.
     */
    orderBy?: MeasurementSiangOrderByWithRelationInput | MeasurementSiangOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MeasurementSiangs.
     */
    cursor?: MeasurementSiangWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MeasurementSiangs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MeasurementSiangs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MeasurementSiangs.
     */
    distinct?: MeasurementSiangScalarFieldEnum | MeasurementSiangScalarFieldEnum[]
  }

  /**
   * MeasurementSiang findFirstOrThrow
   */
  export type MeasurementSiangFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementSiang
     */
    select?: MeasurementSiangSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementSiang
     */
    omit?: MeasurementSiangOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementSiangInclude<ExtArgs> | null
    /**
     * Filter, which MeasurementSiang to fetch.
     */
    where?: MeasurementSiangWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MeasurementSiangs to fetch.
     */
    orderBy?: MeasurementSiangOrderByWithRelationInput | MeasurementSiangOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MeasurementSiangs.
     */
    cursor?: MeasurementSiangWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MeasurementSiangs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MeasurementSiangs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MeasurementSiangs.
     */
    distinct?: MeasurementSiangScalarFieldEnum | MeasurementSiangScalarFieldEnum[]
  }

  /**
   * MeasurementSiang findMany
   */
  export type MeasurementSiangFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementSiang
     */
    select?: MeasurementSiangSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementSiang
     */
    omit?: MeasurementSiangOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementSiangInclude<ExtArgs> | null
    /**
     * Filter, which MeasurementSiangs to fetch.
     */
    where?: MeasurementSiangWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MeasurementSiangs to fetch.
     */
    orderBy?: MeasurementSiangOrderByWithRelationInput | MeasurementSiangOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MeasurementSiangs.
     */
    cursor?: MeasurementSiangWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MeasurementSiangs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MeasurementSiangs.
     */
    skip?: number
    distinct?: MeasurementSiangScalarFieldEnum | MeasurementSiangScalarFieldEnum[]
  }

  /**
   * MeasurementSiang create
   */
  export type MeasurementSiangCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementSiang
     */
    select?: MeasurementSiangSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementSiang
     */
    omit?: MeasurementSiangOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementSiangInclude<ExtArgs> | null
    /**
     * The data needed to create a MeasurementSiang.
     */
    data: XOR<MeasurementSiangCreateInput, MeasurementSiangUncheckedCreateInput>
  }

  /**
   * MeasurementSiang createMany
   */
  export type MeasurementSiangCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MeasurementSiangs.
     */
    data: MeasurementSiangCreateManyInput | MeasurementSiangCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MeasurementSiang createManyAndReturn
   */
  export type MeasurementSiangCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementSiang
     */
    select?: MeasurementSiangSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementSiang
     */
    omit?: MeasurementSiangOmit<ExtArgs> | null
    /**
     * The data used to create many MeasurementSiangs.
     */
    data: MeasurementSiangCreateManyInput | MeasurementSiangCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementSiangIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MeasurementSiang update
   */
  export type MeasurementSiangUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementSiang
     */
    select?: MeasurementSiangSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementSiang
     */
    omit?: MeasurementSiangOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementSiangInclude<ExtArgs> | null
    /**
     * The data needed to update a MeasurementSiang.
     */
    data: XOR<MeasurementSiangUpdateInput, MeasurementSiangUncheckedUpdateInput>
    /**
     * Choose, which MeasurementSiang to update.
     */
    where: MeasurementSiangWhereUniqueInput
  }

  /**
   * MeasurementSiang updateMany
   */
  export type MeasurementSiangUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MeasurementSiangs.
     */
    data: XOR<MeasurementSiangUpdateManyMutationInput, MeasurementSiangUncheckedUpdateManyInput>
    /**
     * Filter which MeasurementSiangs to update
     */
    where?: MeasurementSiangWhereInput
    /**
     * Limit how many MeasurementSiangs to update.
     */
    limit?: number
  }

  /**
   * MeasurementSiang updateManyAndReturn
   */
  export type MeasurementSiangUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementSiang
     */
    select?: MeasurementSiangSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementSiang
     */
    omit?: MeasurementSiangOmit<ExtArgs> | null
    /**
     * The data used to update MeasurementSiangs.
     */
    data: XOR<MeasurementSiangUpdateManyMutationInput, MeasurementSiangUncheckedUpdateManyInput>
    /**
     * Filter which MeasurementSiangs to update
     */
    where?: MeasurementSiangWhereInput
    /**
     * Limit how many MeasurementSiangs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementSiangIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MeasurementSiang upsert
   */
  export type MeasurementSiangUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementSiang
     */
    select?: MeasurementSiangSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementSiang
     */
    omit?: MeasurementSiangOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementSiangInclude<ExtArgs> | null
    /**
     * The filter to search for the MeasurementSiang to update in case it exists.
     */
    where: MeasurementSiangWhereUniqueInput
    /**
     * In case the MeasurementSiang found by the `where` argument doesn't exist, create a new MeasurementSiang with this data.
     */
    create: XOR<MeasurementSiangCreateInput, MeasurementSiangUncheckedCreateInput>
    /**
     * In case the MeasurementSiang was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MeasurementSiangUpdateInput, MeasurementSiangUncheckedUpdateInput>
  }

  /**
   * MeasurementSiang delete
   */
  export type MeasurementSiangDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementSiang
     */
    select?: MeasurementSiangSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementSiang
     */
    omit?: MeasurementSiangOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementSiangInclude<ExtArgs> | null
    /**
     * Filter which MeasurementSiang to delete.
     */
    where: MeasurementSiangWhereUniqueInput
  }

  /**
   * MeasurementSiang deleteMany
   */
  export type MeasurementSiangDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MeasurementSiangs to delete
     */
    where?: MeasurementSiangWhereInput
    /**
     * Limit how many MeasurementSiangs to delete.
     */
    limit?: number
  }

  /**
   * MeasurementSiang without action
   */
  export type MeasurementSiangDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementSiang
     */
    select?: MeasurementSiangSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementSiang
     */
    omit?: MeasurementSiangOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementSiangInclude<ExtArgs> | null
  }


  /**
   * Model MeasurementMalam
   */

  export type AggregateMeasurementMalam = {
    _count: MeasurementMalamCountAggregateOutputType | null
    _avg: MeasurementMalamAvgAggregateOutputType | null
    _sum: MeasurementMalamSumAggregateOutputType | null
    _min: MeasurementMalamMinAggregateOutputType | null
    _max: MeasurementMalamMaxAggregateOutputType | null
  }

  export type MeasurementMalamAvgAggregateOutputType = {
    id: number | null
    r: number | null
    s: number | null
    t: number | null
    n: number | null
    rn: number | null
    sn: number | null
    tn: number | null
    pp: number | null
    pn: number | null
    rata2: number | null
    kva: number | null
    persen: number | null
    unbalanced: number | null
  }

  export type MeasurementMalamSumAggregateOutputType = {
    id: number | null
    r: number | null
    s: number | null
    t: number | null
    n: number | null
    rn: number | null
    sn: number | null
    tn: number | null
    pp: number | null
    pn: number | null
    rata2: number | null
    kva: number | null
    persen: number | null
    unbalanced: number | null
  }

  export type MeasurementMalamMinAggregateOutputType = {
    id: number | null
    substationId: string | null
    month: string | null
    r: number | null
    s: number | null
    t: number | null
    n: number | null
    rn: number | null
    sn: number | null
    tn: number | null
    pp: number | null
    pn: number | null
    row_name: string | null
    rata2: number | null
    kva: number | null
    persen: number | null
    unbalanced: number | null
    lastUpdate: Date | null
  }

  export type MeasurementMalamMaxAggregateOutputType = {
    id: number | null
    substationId: string | null
    month: string | null
    r: number | null
    s: number | null
    t: number | null
    n: number | null
    rn: number | null
    sn: number | null
    tn: number | null
    pp: number | null
    pn: number | null
    row_name: string | null
    rata2: number | null
    kva: number | null
    persen: number | null
    unbalanced: number | null
    lastUpdate: Date | null
  }

  export type MeasurementMalamCountAggregateOutputType = {
    id: number
    substationId: number
    month: number
    r: number
    s: number
    t: number
    n: number
    rn: number
    sn: number
    tn: number
    pp: number
    pn: number
    row_name: number
    rata2: number
    kva: number
    persen: number
    unbalanced: number
    lastUpdate: number
    _all: number
  }


  export type MeasurementMalamAvgAggregateInputType = {
    id?: true
    r?: true
    s?: true
    t?: true
    n?: true
    rn?: true
    sn?: true
    tn?: true
    pp?: true
    pn?: true
    rata2?: true
    kva?: true
    persen?: true
    unbalanced?: true
  }

  export type MeasurementMalamSumAggregateInputType = {
    id?: true
    r?: true
    s?: true
    t?: true
    n?: true
    rn?: true
    sn?: true
    tn?: true
    pp?: true
    pn?: true
    rata2?: true
    kva?: true
    persen?: true
    unbalanced?: true
  }

  export type MeasurementMalamMinAggregateInputType = {
    id?: true
    substationId?: true
    month?: true
    r?: true
    s?: true
    t?: true
    n?: true
    rn?: true
    sn?: true
    tn?: true
    pp?: true
    pn?: true
    row_name?: true
    rata2?: true
    kva?: true
    persen?: true
    unbalanced?: true
    lastUpdate?: true
  }

  export type MeasurementMalamMaxAggregateInputType = {
    id?: true
    substationId?: true
    month?: true
    r?: true
    s?: true
    t?: true
    n?: true
    rn?: true
    sn?: true
    tn?: true
    pp?: true
    pn?: true
    row_name?: true
    rata2?: true
    kva?: true
    persen?: true
    unbalanced?: true
    lastUpdate?: true
  }

  export type MeasurementMalamCountAggregateInputType = {
    id?: true
    substationId?: true
    month?: true
    r?: true
    s?: true
    t?: true
    n?: true
    rn?: true
    sn?: true
    tn?: true
    pp?: true
    pn?: true
    row_name?: true
    rata2?: true
    kva?: true
    persen?: true
    unbalanced?: true
    lastUpdate?: true
    _all?: true
  }

  export type MeasurementMalamAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MeasurementMalam to aggregate.
     */
    where?: MeasurementMalamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MeasurementMalams to fetch.
     */
    orderBy?: MeasurementMalamOrderByWithRelationInput | MeasurementMalamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MeasurementMalamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MeasurementMalams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MeasurementMalams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MeasurementMalams
    **/
    _count?: true | MeasurementMalamCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MeasurementMalamAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MeasurementMalamSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MeasurementMalamMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MeasurementMalamMaxAggregateInputType
  }

  export type GetMeasurementMalamAggregateType<T extends MeasurementMalamAggregateArgs> = {
        [P in keyof T & keyof AggregateMeasurementMalam]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMeasurementMalam[P]>
      : GetScalarType<T[P], AggregateMeasurementMalam[P]>
  }




  export type MeasurementMalamGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MeasurementMalamWhereInput
    orderBy?: MeasurementMalamOrderByWithAggregationInput | MeasurementMalamOrderByWithAggregationInput[]
    by: MeasurementMalamScalarFieldEnum[] | MeasurementMalamScalarFieldEnum
    having?: MeasurementMalamScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MeasurementMalamCountAggregateInputType | true
    _avg?: MeasurementMalamAvgAggregateInputType
    _sum?: MeasurementMalamSumAggregateInputType
    _min?: MeasurementMalamMinAggregateInputType
    _max?: MeasurementMalamMaxAggregateInputType
  }

  export type MeasurementMalamGroupByOutputType = {
    id: number
    substationId: string
    month: string
    r: number
    s: number
    t: number
    n: number
    rn: number
    sn: number
    tn: number
    pp: number
    pn: number
    row_name: string
    rata2: number | null
    kva: number | null
    persen: number | null
    unbalanced: number | null
    lastUpdate: Date
    _count: MeasurementMalamCountAggregateOutputType | null
    _avg: MeasurementMalamAvgAggregateOutputType | null
    _sum: MeasurementMalamSumAggregateOutputType | null
    _min: MeasurementMalamMinAggregateOutputType | null
    _max: MeasurementMalamMaxAggregateOutputType | null
  }

  type GetMeasurementMalamGroupByPayload<T extends MeasurementMalamGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MeasurementMalamGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MeasurementMalamGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MeasurementMalamGroupByOutputType[P]>
            : GetScalarType<T[P], MeasurementMalamGroupByOutputType[P]>
        }
      >
    >


  export type MeasurementMalamSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    substationId?: boolean
    month?: boolean
    r?: boolean
    s?: boolean
    t?: boolean
    n?: boolean
    rn?: boolean
    sn?: boolean
    tn?: boolean
    pp?: boolean
    pn?: boolean
    row_name?: boolean
    rata2?: boolean
    kva?: boolean
    persen?: boolean
    unbalanced?: boolean
    lastUpdate?: boolean
    substation?: boolean | SubstationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["measurementMalam"]>

  export type MeasurementMalamSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    substationId?: boolean
    month?: boolean
    r?: boolean
    s?: boolean
    t?: boolean
    n?: boolean
    rn?: boolean
    sn?: boolean
    tn?: boolean
    pp?: boolean
    pn?: boolean
    row_name?: boolean
    rata2?: boolean
    kva?: boolean
    persen?: boolean
    unbalanced?: boolean
    lastUpdate?: boolean
    substation?: boolean | SubstationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["measurementMalam"]>

  export type MeasurementMalamSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    substationId?: boolean
    month?: boolean
    r?: boolean
    s?: boolean
    t?: boolean
    n?: boolean
    rn?: boolean
    sn?: boolean
    tn?: boolean
    pp?: boolean
    pn?: boolean
    row_name?: boolean
    rata2?: boolean
    kva?: boolean
    persen?: boolean
    unbalanced?: boolean
    lastUpdate?: boolean
    substation?: boolean | SubstationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["measurementMalam"]>

  export type MeasurementMalamSelectScalar = {
    id?: boolean
    substationId?: boolean
    month?: boolean
    r?: boolean
    s?: boolean
    t?: boolean
    n?: boolean
    rn?: boolean
    sn?: boolean
    tn?: boolean
    pp?: boolean
    pn?: boolean
    row_name?: boolean
    rata2?: boolean
    kva?: boolean
    persen?: boolean
    unbalanced?: boolean
    lastUpdate?: boolean
  }

  export type MeasurementMalamOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "substationId" | "month" | "r" | "s" | "t" | "n" | "rn" | "sn" | "tn" | "pp" | "pn" | "row_name" | "rata2" | "kva" | "persen" | "unbalanced" | "lastUpdate", ExtArgs["result"]["measurementMalam"]>
  export type MeasurementMalamInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    substation?: boolean | SubstationDefaultArgs<ExtArgs>
  }
  export type MeasurementMalamIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    substation?: boolean | SubstationDefaultArgs<ExtArgs>
  }
  export type MeasurementMalamIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    substation?: boolean | SubstationDefaultArgs<ExtArgs>
  }

  export type $MeasurementMalamPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MeasurementMalam"
    objects: {
      substation: Prisma.$SubstationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      substationId: string
      month: string
      r: number
      s: number
      t: number
      n: number
      rn: number
      sn: number
      tn: number
      pp: number
      pn: number
      row_name: string
      rata2: number | null
      kva: number | null
      persen: number | null
      unbalanced: number | null
      lastUpdate: Date
    }, ExtArgs["result"]["measurementMalam"]>
    composites: {}
  }

  type MeasurementMalamGetPayload<S extends boolean | null | undefined | MeasurementMalamDefaultArgs> = $Result.GetResult<Prisma.$MeasurementMalamPayload, S>

  type MeasurementMalamCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MeasurementMalamFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MeasurementMalamCountAggregateInputType | true
    }

  export interface MeasurementMalamDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MeasurementMalam'], meta: { name: 'MeasurementMalam' } }
    /**
     * Find zero or one MeasurementMalam that matches the filter.
     * @param {MeasurementMalamFindUniqueArgs} args - Arguments to find a MeasurementMalam
     * @example
     * // Get one MeasurementMalam
     * const measurementMalam = await prisma.measurementMalam.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MeasurementMalamFindUniqueArgs>(args: SelectSubset<T, MeasurementMalamFindUniqueArgs<ExtArgs>>): Prisma__MeasurementMalamClient<$Result.GetResult<Prisma.$MeasurementMalamPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MeasurementMalam that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MeasurementMalamFindUniqueOrThrowArgs} args - Arguments to find a MeasurementMalam
     * @example
     * // Get one MeasurementMalam
     * const measurementMalam = await prisma.measurementMalam.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MeasurementMalamFindUniqueOrThrowArgs>(args: SelectSubset<T, MeasurementMalamFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MeasurementMalamClient<$Result.GetResult<Prisma.$MeasurementMalamPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MeasurementMalam that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementMalamFindFirstArgs} args - Arguments to find a MeasurementMalam
     * @example
     * // Get one MeasurementMalam
     * const measurementMalam = await prisma.measurementMalam.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MeasurementMalamFindFirstArgs>(args?: SelectSubset<T, MeasurementMalamFindFirstArgs<ExtArgs>>): Prisma__MeasurementMalamClient<$Result.GetResult<Prisma.$MeasurementMalamPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MeasurementMalam that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementMalamFindFirstOrThrowArgs} args - Arguments to find a MeasurementMalam
     * @example
     * // Get one MeasurementMalam
     * const measurementMalam = await prisma.measurementMalam.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MeasurementMalamFindFirstOrThrowArgs>(args?: SelectSubset<T, MeasurementMalamFindFirstOrThrowArgs<ExtArgs>>): Prisma__MeasurementMalamClient<$Result.GetResult<Prisma.$MeasurementMalamPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MeasurementMalams that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementMalamFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MeasurementMalams
     * const measurementMalams = await prisma.measurementMalam.findMany()
     * 
     * // Get first 10 MeasurementMalams
     * const measurementMalams = await prisma.measurementMalam.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const measurementMalamWithIdOnly = await prisma.measurementMalam.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MeasurementMalamFindManyArgs>(args?: SelectSubset<T, MeasurementMalamFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MeasurementMalamPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MeasurementMalam.
     * @param {MeasurementMalamCreateArgs} args - Arguments to create a MeasurementMalam.
     * @example
     * // Create one MeasurementMalam
     * const MeasurementMalam = await prisma.measurementMalam.create({
     *   data: {
     *     // ... data to create a MeasurementMalam
     *   }
     * })
     * 
     */
    create<T extends MeasurementMalamCreateArgs>(args: SelectSubset<T, MeasurementMalamCreateArgs<ExtArgs>>): Prisma__MeasurementMalamClient<$Result.GetResult<Prisma.$MeasurementMalamPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MeasurementMalams.
     * @param {MeasurementMalamCreateManyArgs} args - Arguments to create many MeasurementMalams.
     * @example
     * // Create many MeasurementMalams
     * const measurementMalam = await prisma.measurementMalam.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MeasurementMalamCreateManyArgs>(args?: SelectSubset<T, MeasurementMalamCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MeasurementMalams and returns the data saved in the database.
     * @param {MeasurementMalamCreateManyAndReturnArgs} args - Arguments to create many MeasurementMalams.
     * @example
     * // Create many MeasurementMalams
     * const measurementMalam = await prisma.measurementMalam.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MeasurementMalams and only return the `id`
     * const measurementMalamWithIdOnly = await prisma.measurementMalam.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MeasurementMalamCreateManyAndReturnArgs>(args?: SelectSubset<T, MeasurementMalamCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MeasurementMalamPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MeasurementMalam.
     * @param {MeasurementMalamDeleteArgs} args - Arguments to delete one MeasurementMalam.
     * @example
     * // Delete one MeasurementMalam
     * const MeasurementMalam = await prisma.measurementMalam.delete({
     *   where: {
     *     // ... filter to delete one MeasurementMalam
     *   }
     * })
     * 
     */
    delete<T extends MeasurementMalamDeleteArgs>(args: SelectSubset<T, MeasurementMalamDeleteArgs<ExtArgs>>): Prisma__MeasurementMalamClient<$Result.GetResult<Prisma.$MeasurementMalamPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MeasurementMalam.
     * @param {MeasurementMalamUpdateArgs} args - Arguments to update one MeasurementMalam.
     * @example
     * // Update one MeasurementMalam
     * const measurementMalam = await prisma.measurementMalam.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MeasurementMalamUpdateArgs>(args: SelectSubset<T, MeasurementMalamUpdateArgs<ExtArgs>>): Prisma__MeasurementMalamClient<$Result.GetResult<Prisma.$MeasurementMalamPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MeasurementMalams.
     * @param {MeasurementMalamDeleteManyArgs} args - Arguments to filter MeasurementMalams to delete.
     * @example
     * // Delete a few MeasurementMalams
     * const { count } = await prisma.measurementMalam.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MeasurementMalamDeleteManyArgs>(args?: SelectSubset<T, MeasurementMalamDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MeasurementMalams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementMalamUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MeasurementMalams
     * const measurementMalam = await prisma.measurementMalam.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MeasurementMalamUpdateManyArgs>(args: SelectSubset<T, MeasurementMalamUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MeasurementMalams and returns the data updated in the database.
     * @param {MeasurementMalamUpdateManyAndReturnArgs} args - Arguments to update many MeasurementMalams.
     * @example
     * // Update many MeasurementMalams
     * const measurementMalam = await prisma.measurementMalam.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MeasurementMalams and only return the `id`
     * const measurementMalamWithIdOnly = await prisma.measurementMalam.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MeasurementMalamUpdateManyAndReturnArgs>(args: SelectSubset<T, MeasurementMalamUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MeasurementMalamPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MeasurementMalam.
     * @param {MeasurementMalamUpsertArgs} args - Arguments to update or create a MeasurementMalam.
     * @example
     * // Update or create a MeasurementMalam
     * const measurementMalam = await prisma.measurementMalam.upsert({
     *   create: {
     *     // ... data to create a MeasurementMalam
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MeasurementMalam we want to update
     *   }
     * })
     */
    upsert<T extends MeasurementMalamUpsertArgs>(args: SelectSubset<T, MeasurementMalamUpsertArgs<ExtArgs>>): Prisma__MeasurementMalamClient<$Result.GetResult<Prisma.$MeasurementMalamPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MeasurementMalams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementMalamCountArgs} args - Arguments to filter MeasurementMalams to count.
     * @example
     * // Count the number of MeasurementMalams
     * const count = await prisma.measurementMalam.count({
     *   where: {
     *     // ... the filter for the MeasurementMalams we want to count
     *   }
     * })
    **/
    count<T extends MeasurementMalamCountArgs>(
      args?: Subset<T, MeasurementMalamCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MeasurementMalamCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MeasurementMalam.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementMalamAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MeasurementMalamAggregateArgs>(args: Subset<T, MeasurementMalamAggregateArgs>): Prisma.PrismaPromise<GetMeasurementMalamAggregateType<T>>

    /**
     * Group by MeasurementMalam.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MeasurementMalamGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MeasurementMalamGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MeasurementMalamGroupByArgs['orderBy'] }
        : { orderBy?: MeasurementMalamGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MeasurementMalamGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMeasurementMalamGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MeasurementMalam model
   */
  readonly fields: MeasurementMalamFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MeasurementMalam.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MeasurementMalamClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    substation<T extends SubstationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SubstationDefaultArgs<ExtArgs>>): Prisma__SubstationClient<$Result.GetResult<Prisma.$SubstationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MeasurementMalam model
   */
  interface MeasurementMalamFieldRefs {
    readonly id: FieldRef<"MeasurementMalam", 'Int'>
    readonly substationId: FieldRef<"MeasurementMalam", 'String'>
    readonly month: FieldRef<"MeasurementMalam", 'String'>
    readonly r: FieldRef<"MeasurementMalam", 'Float'>
    readonly s: FieldRef<"MeasurementMalam", 'Float'>
    readonly t: FieldRef<"MeasurementMalam", 'Float'>
    readonly n: FieldRef<"MeasurementMalam", 'Float'>
    readonly rn: FieldRef<"MeasurementMalam", 'Float'>
    readonly sn: FieldRef<"MeasurementMalam", 'Float'>
    readonly tn: FieldRef<"MeasurementMalam", 'Float'>
    readonly pp: FieldRef<"MeasurementMalam", 'Float'>
    readonly pn: FieldRef<"MeasurementMalam", 'Float'>
    readonly row_name: FieldRef<"MeasurementMalam", 'String'>
    readonly rata2: FieldRef<"MeasurementMalam", 'Float'>
    readonly kva: FieldRef<"MeasurementMalam", 'Float'>
    readonly persen: FieldRef<"MeasurementMalam", 'Float'>
    readonly unbalanced: FieldRef<"MeasurementMalam", 'Float'>
    readonly lastUpdate: FieldRef<"MeasurementMalam", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MeasurementMalam findUnique
   */
  export type MeasurementMalamFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementMalam
     */
    select?: MeasurementMalamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementMalam
     */
    omit?: MeasurementMalamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementMalamInclude<ExtArgs> | null
    /**
     * Filter, which MeasurementMalam to fetch.
     */
    where: MeasurementMalamWhereUniqueInput
  }

  /**
   * MeasurementMalam findUniqueOrThrow
   */
  export type MeasurementMalamFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementMalam
     */
    select?: MeasurementMalamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementMalam
     */
    omit?: MeasurementMalamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementMalamInclude<ExtArgs> | null
    /**
     * Filter, which MeasurementMalam to fetch.
     */
    where: MeasurementMalamWhereUniqueInput
  }

  /**
   * MeasurementMalam findFirst
   */
  export type MeasurementMalamFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementMalam
     */
    select?: MeasurementMalamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementMalam
     */
    omit?: MeasurementMalamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementMalamInclude<ExtArgs> | null
    /**
     * Filter, which MeasurementMalam to fetch.
     */
    where?: MeasurementMalamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MeasurementMalams to fetch.
     */
    orderBy?: MeasurementMalamOrderByWithRelationInput | MeasurementMalamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MeasurementMalams.
     */
    cursor?: MeasurementMalamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MeasurementMalams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MeasurementMalams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MeasurementMalams.
     */
    distinct?: MeasurementMalamScalarFieldEnum | MeasurementMalamScalarFieldEnum[]
  }

  /**
   * MeasurementMalam findFirstOrThrow
   */
  export type MeasurementMalamFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementMalam
     */
    select?: MeasurementMalamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementMalam
     */
    omit?: MeasurementMalamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementMalamInclude<ExtArgs> | null
    /**
     * Filter, which MeasurementMalam to fetch.
     */
    where?: MeasurementMalamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MeasurementMalams to fetch.
     */
    orderBy?: MeasurementMalamOrderByWithRelationInput | MeasurementMalamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MeasurementMalams.
     */
    cursor?: MeasurementMalamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MeasurementMalams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MeasurementMalams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MeasurementMalams.
     */
    distinct?: MeasurementMalamScalarFieldEnum | MeasurementMalamScalarFieldEnum[]
  }

  /**
   * MeasurementMalam findMany
   */
  export type MeasurementMalamFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementMalam
     */
    select?: MeasurementMalamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementMalam
     */
    omit?: MeasurementMalamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementMalamInclude<ExtArgs> | null
    /**
     * Filter, which MeasurementMalams to fetch.
     */
    where?: MeasurementMalamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MeasurementMalams to fetch.
     */
    orderBy?: MeasurementMalamOrderByWithRelationInput | MeasurementMalamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MeasurementMalams.
     */
    cursor?: MeasurementMalamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MeasurementMalams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MeasurementMalams.
     */
    skip?: number
    distinct?: MeasurementMalamScalarFieldEnum | MeasurementMalamScalarFieldEnum[]
  }

  /**
   * MeasurementMalam create
   */
  export type MeasurementMalamCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementMalam
     */
    select?: MeasurementMalamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementMalam
     */
    omit?: MeasurementMalamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementMalamInclude<ExtArgs> | null
    /**
     * The data needed to create a MeasurementMalam.
     */
    data: XOR<MeasurementMalamCreateInput, MeasurementMalamUncheckedCreateInput>
  }

  /**
   * MeasurementMalam createMany
   */
  export type MeasurementMalamCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MeasurementMalams.
     */
    data: MeasurementMalamCreateManyInput | MeasurementMalamCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MeasurementMalam createManyAndReturn
   */
  export type MeasurementMalamCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementMalam
     */
    select?: MeasurementMalamSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementMalam
     */
    omit?: MeasurementMalamOmit<ExtArgs> | null
    /**
     * The data used to create many MeasurementMalams.
     */
    data: MeasurementMalamCreateManyInput | MeasurementMalamCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementMalamIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MeasurementMalam update
   */
  export type MeasurementMalamUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementMalam
     */
    select?: MeasurementMalamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementMalam
     */
    omit?: MeasurementMalamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementMalamInclude<ExtArgs> | null
    /**
     * The data needed to update a MeasurementMalam.
     */
    data: XOR<MeasurementMalamUpdateInput, MeasurementMalamUncheckedUpdateInput>
    /**
     * Choose, which MeasurementMalam to update.
     */
    where: MeasurementMalamWhereUniqueInput
  }

  /**
   * MeasurementMalam updateMany
   */
  export type MeasurementMalamUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MeasurementMalams.
     */
    data: XOR<MeasurementMalamUpdateManyMutationInput, MeasurementMalamUncheckedUpdateManyInput>
    /**
     * Filter which MeasurementMalams to update
     */
    where?: MeasurementMalamWhereInput
    /**
     * Limit how many MeasurementMalams to update.
     */
    limit?: number
  }

  /**
   * MeasurementMalam updateManyAndReturn
   */
  export type MeasurementMalamUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementMalam
     */
    select?: MeasurementMalamSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementMalam
     */
    omit?: MeasurementMalamOmit<ExtArgs> | null
    /**
     * The data used to update MeasurementMalams.
     */
    data: XOR<MeasurementMalamUpdateManyMutationInput, MeasurementMalamUncheckedUpdateManyInput>
    /**
     * Filter which MeasurementMalams to update
     */
    where?: MeasurementMalamWhereInput
    /**
     * Limit how many MeasurementMalams to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementMalamIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MeasurementMalam upsert
   */
  export type MeasurementMalamUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementMalam
     */
    select?: MeasurementMalamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementMalam
     */
    omit?: MeasurementMalamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementMalamInclude<ExtArgs> | null
    /**
     * The filter to search for the MeasurementMalam to update in case it exists.
     */
    where: MeasurementMalamWhereUniqueInput
    /**
     * In case the MeasurementMalam found by the `where` argument doesn't exist, create a new MeasurementMalam with this data.
     */
    create: XOR<MeasurementMalamCreateInput, MeasurementMalamUncheckedCreateInput>
    /**
     * In case the MeasurementMalam was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MeasurementMalamUpdateInput, MeasurementMalamUncheckedUpdateInput>
  }

  /**
   * MeasurementMalam delete
   */
  export type MeasurementMalamDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementMalam
     */
    select?: MeasurementMalamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementMalam
     */
    omit?: MeasurementMalamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementMalamInclude<ExtArgs> | null
    /**
     * Filter which MeasurementMalam to delete.
     */
    where: MeasurementMalamWhereUniqueInput
  }

  /**
   * MeasurementMalam deleteMany
   */
  export type MeasurementMalamDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MeasurementMalams to delete
     */
    where?: MeasurementMalamWhereInput
    /**
     * Limit how many MeasurementMalams to delete.
     */
    limit?: number
  }

  /**
   * MeasurementMalam without action
   */
  export type MeasurementMalamDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MeasurementMalam
     */
    select?: MeasurementMalamSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MeasurementMalam
     */
    omit?: MeasurementMalamOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MeasurementMalamInclude<ExtArgs> | null
  }


  /**
   * Model AdminUser
   */

  export type AggregateAdminUser = {
    _count: AdminUserCountAggregateOutputType | null
    _avg: AdminUserAvgAggregateOutputType | null
    _sum: AdminUserSumAggregateOutputType | null
    _min: AdminUserMinAggregateOutputType | null
    _max: AdminUserMaxAggregateOutputType | null
  }

  export type AdminUserAvgAggregateOutputType = {
    id: number | null
  }

  export type AdminUserSumAggregateOutputType = {
    id: number | null
  }

  export type AdminUserMinAggregateOutputType = {
    id: number | null
    username: string | null
    password_hash: string | null
    role: string | null
    created_at: Date | null
  }

  export type AdminUserMaxAggregateOutputType = {
    id: number | null
    username: string | null
    password_hash: string | null
    role: string | null
    created_at: Date | null
  }

  export type AdminUserCountAggregateOutputType = {
    id: number
    username: number
    password_hash: number
    role: number
    created_at: number
    _all: number
  }


  export type AdminUserAvgAggregateInputType = {
    id?: true
  }

  export type AdminUserSumAggregateInputType = {
    id?: true
  }

  export type AdminUserMinAggregateInputType = {
    id?: true
    username?: true
    password_hash?: true
    role?: true
    created_at?: true
  }

  export type AdminUserMaxAggregateInputType = {
    id?: true
    username?: true
    password_hash?: true
    role?: true
    created_at?: true
  }

  export type AdminUserCountAggregateInputType = {
    id?: true
    username?: true
    password_hash?: true
    role?: true
    created_at?: true
    _all?: true
  }

  export type AdminUserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdminUser to aggregate.
     */
    where?: AdminUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminUsers to fetch.
     */
    orderBy?: AdminUserOrderByWithRelationInput | AdminUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AdminUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AdminUsers
    **/
    _count?: true | AdminUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AdminUserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AdminUserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AdminUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AdminUserMaxAggregateInputType
  }

  export type GetAdminUserAggregateType<T extends AdminUserAggregateArgs> = {
        [P in keyof T & keyof AggregateAdminUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAdminUser[P]>
      : GetScalarType<T[P], AggregateAdminUser[P]>
  }




  export type AdminUserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AdminUserWhereInput
    orderBy?: AdminUserOrderByWithAggregationInput | AdminUserOrderByWithAggregationInput[]
    by: AdminUserScalarFieldEnum[] | AdminUserScalarFieldEnum
    having?: AdminUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AdminUserCountAggregateInputType | true
    _avg?: AdminUserAvgAggregateInputType
    _sum?: AdminUserSumAggregateInputType
    _min?: AdminUserMinAggregateInputType
    _max?: AdminUserMaxAggregateInputType
  }

  export type AdminUserGroupByOutputType = {
    id: number
    username: string
    password_hash: string
    role: string
    created_at: Date
    _count: AdminUserCountAggregateOutputType | null
    _avg: AdminUserAvgAggregateOutputType | null
    _sum: AdminUserSumAggregateOutputType | null
    _min: AdminUserMinAggregateOutputType | null
    _max: AdminUserMaxAggregateOutputType | null
  }

  type GetAdminUserGroupByPayload<T extends AdminUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AdminUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AdminUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AdminUserGroupByOutputType[P]>
            : GetScalarType<T[P], AdminUserGroupByOutputType[P]>
        }
      >
    >


  export type AdminUserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password_hash?: boolean
    role?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["adminUser"]>

  export type AdminUserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password_hash?: boolean
    role?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["adminUser"]>

  export type AdminUserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    password_hash?: boolean
    role?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["adminUser"]>

  export type AdminUserSelectScalar = {
    id?: boolean
    username?: boolean
    password_hash?: boolean
    role?: boolean
    created_at?: boolean
  }

  export type AdminUserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "password_hash" | "role" | "created_at", ExtArgs["result"]["adminUser"]>

  export type $AdminUserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AdminUser"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      username: string
      password_hash: string
      role: string
      created_at: Date
    }, ExtArgs["result"]["adminUser"]>
    composites: {}
  }

  type AdminUserGetPayload<S extends boolean | null | undefined | AdminUserDefaultArgs> = $Result.GetResult<Prisma.$AdminUserPayload, S>

  type AdminUserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AdminUserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AdminUserCountAggregateInputType | true
    }

  export interface AdminUserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AdminUser'], meta: { name: 'AdminUser' } }
    /**
     * Find zero or one AdminUser that matches the filter.
     * @param {AdminUserFindUniqueArgs} args - Arguments to find a AdminUser
     * @example
     * // Get one AdminUser
     * const adminUser = await prisma.adminUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AdminUserFindUniqueArgs>(args: SelectSubset<T, AdminUserFindUniqueArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AdminUser that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AdminUserFindUniqueOrThrowArgs} args - Arguments to find a AdminUser
     * @example
     * // Get one AdminUser
     * const adminUser = await prisma.adminUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AdminUserFindUniqueOrThrowArgs>(args: SelectSubset<T, AdminUserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdminUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserFindFirstArgs} args - Arguments to find a AdminUser
     * @example
     * // Get one AdminUser
     * const adminUser = await prisma.adminUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AdminUserFindFirstArgs>(args?: SelectSubset<T, AdminUserFindFirstArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdminUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserFindFirstOrThrowArgs} args - Arguments to find a AdminUser
     * @example
     * // Get one AdminUser
     * const adminUser = await prisma.adminUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AdminUserFindFirstOrThrowArgs>(args?: SelectSubset<T, AdminUserFindFirstOrThrowArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AdminUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AdminUsers
     * const adminUsers = await prisma.adminUser.findMany()
     * 
     * // Get first 10 AdminUsers
     * const adminUsers = await prisma.adminUser.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const adminUserWithIdOnly = await prisma.adminUser.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AdminUserFindManyArgs>(args?: SelectSubset<T, AdminUserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AdminUser.
     * @param {AdminUserCreateArgs} args - Arguments to create a AdminUser.
     * @example
     * // Create one AdminUser
     * const AdminUser = await prisma.adminUser.create({
     *   data: {
     *     // ... data to create a AdminUser
     *   }
     * })
     * 
     */
    create<T extends AdminUserCreateArgs>(args: SelectSubset<T, AdminUserCreateArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AdminUsers.
     * @param {AdminUserCreateManyArgs} args - Arguments to create many AdminUsers.
     * @example
     * // Create many AdminUsers
     * const adminUser = await prisma.adminUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AdminUserCreateManyArgs>(args?: SelectSubset<T, AdminUserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AdminUsers and returns the data saved in the database.
     * @param {AdminUserCreateManyAndReturnArgs} args - Arguments to create many AdminUsers.
     * @example
     * // Create many AdminUsers
     * const adminUser = await prisma.adminUser.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AdminUsers and only return the `id`
     * const adminUserWithIdOnly = await prisma.adminUser.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AdminUserCreateManyAndReturnArgs>(args?: SelectSubset<T, AdminUserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AdminUser.
     * @param {AdminUserDeleteArgs} args - Arguments to delete one AdminUser.
     * @example
     * // Delete one AdminUser
     * const AdminUser = await prisma.adminUser.delete({
     *   where: {
     *     // ... filter to delete one AdminUser
     *   }
     * })
     * 
     */
    delete<T extends AdminUserDeleteArgs>(args: SelectSubset<T, AdminUserDeleteArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AdminUser.
     * @param {AdminUserUpdateArgs} args - Arguments to update one AdminUser.
     * @example
     * // Update one AdminUser
     * const adminUser = await prisma.adminUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AdminUserUpdateArgs>(args: SelectSubset<T, AdminUserUpdateArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AdminUsers.
     * @param {AdminUserDeleteManyArgs} args - Arguments to filter AdminUsers to delete.
     * @example
     * // Delete a few AdminUsers
     * const { count } = await prisma.adminUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AdminUserDeleteManyArgs>(args?: SelectSubset<T, AdminUserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdminUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AdminUsers
     * const adminUser = await prisma.adminUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AdminUserUpdateManyArgs>(args: SelectSubset<T, AdminUserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdminUsers and returns the data updated in the database.
     * @param {AdminUserUpdateManyAndReturnArgs} args - Arguments to update many AdminUsers.
     * @example
     * // Update many AdminUsers
     * const adminUser = await prisma.adminUser.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AdminUsers and only return the `id`
     * const adminUserWithIdOnly = await prisma.adminUser.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AdminUserUpdateManyAndReturnArgs>(args: SelectSubset<T, AdminUserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AdminUser.
     * @param {AdminUserUpsertArgs} args - Arguments to update or create a AdminUser.
     * @example
     * // Update or create a AdminUser
     * const adminUser = await prisma.adminUser.upsert({
     *   create: {
     *     // ... data to create a AdminUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AdminUser we want to update
     *   }
     * })
     */
    upsert<T extends AdminUserUpsertArgs>(args: SelectSubset<T, AdminUserUpsertArgs<ExtArgs>>): Prisma__AdminUserClient<$Result.GetResult<Prisma.$AdminUserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AdminUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserCountArgs} args - Arguments to filter AdminUsers to count.
     * @example
     * // Count the number of AdminUsers
     * const count = await prisma.adminUser.count({
     *   where: {
     *     // ... the filter for the AdminUsers we want to count
     *   }
     * })
    **/
    count<T extends AdminUserCountArgs>(
      args?: Subset<T, AdminUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AdminUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AdminUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AdminUserAggregateArgs>(args: Subset<T, AdminUserAggregateArgs>): Prisma.PrismaPromise<GetAdminUserAggregateType<T>>

    /**
     * Group by AdminUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AdminUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AdminUserGroupByArgs['orderBy'] }
        : { orderBy?: AdminUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AdminUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAdminUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AdminUser model
   */
  readonly fields: AdminUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AdminUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AdminUserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AdminUser model
   */
  interface AdminUserFieldRefs {
    readonly id: FieldRef<"AdminUser", 'Int'>
    readonly username: FieldRef<"AdminUser", 'String'>
    readonly password_hash: FieldRef<"AdminUser", 'String'>
    readonly role: FieldRef<"AdminUser", 'String'>
    readonly created_at: FieldRef<"AdminUser", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AdminUser findUnique
   */
  export type AdminUserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * Filter, which AdminUser to fetch.
     */
    where: AdminUserWhereUniqueInput
  }

  /**
   * AdminUser findUniqueOrThrow
   */
  export type AdminUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * Filter, which AdminUser to fetch.
     */
    where: AdminUserWhereUniqueInput
  }

  /**
   * AdminUser findFirst
   */
  export type AdminUserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * Filter, which AdminUser to fetch.
     */
    where?: AdminUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminUsers to fetch.
     */
    orderBy?: AdminUserOrderByWithRelationInput | AdminUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdminUsers.
     */
    cursor?: AdminUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdminUsers.
     */
    distinct?: AdminUserScalarFieldEnum | AdminUserScalarFieldEnum[]
  }

  /**
   * AdminUser findFirstOrThrow
   */
  export type AdminUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * Filter, which AdminUser to fetch.
     */
    where?: AdminUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminUsers to fetch.
     */
    orderBy?: AdminUserOrderByWithRelationInput | AdminUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdminUsers.
     */
    cursor?: AdminUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdminUsers.
     */
    distinct?: AdminUserScalarFieldEnum | AdminUserScalarFieldEnum[]
  }

  /**
   * AdminUser findMany
   */
  export type AdminUserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * Filter, which AdminUsers to fetch.
     */
    where?: AdminUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminUsers to fetch.
     */
    orderBy?: AdminUserOrderByWithRelationInput | AdminUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AdminUsers.
     */
    cursor?: AdminUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminUsers.
     */
    skip?: number
    distinct?: AdminUserScalarFieldEnum | AdminUserScalarFieldEnum[]
  }

  /**
   * AdminUser create
   */
  export type AdminUserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * The data needed to create a AdminUser.
     */
    data: XOR<AdminUserCreateInput, AdminUserUncheckedCreateInput>
  }

  /**
   * AdminUser createMany
   */
  export type AdminUserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AdminUsers.
     */
    data: AdminUserCreateManyInput | AdminUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AdminUser createManyAndReturn
   */
  export type AdminUserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * The data used to create many AdminUsers.
     */
    data: AdminUserCreateManyInput | AdminUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AdminUser update
   */
  export type AdminUserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * The data needed to update a AdminUser.
     */
    data: XOR<AdminUserUpdateInput, AdminUserUncheckedUpdateInput>
    /**
     * Choose, which AdminUser to update.
     */
    where: AdminUserWhereUniqueInput
  }

  /**
   * AdminUser updateMany
   */
  export type AdminUserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AdminUsers.
     */
    data: XOR<AdminUserUpdateManyMutationInput, AdminUserUncheckedUpdateManyInput>
    /**
     * Filter which AdminUsers to update
     */
    where?: AdminUserWhereInput
    /**
     * Limit how many AdminUsers to update.
     */
    limit?: number
  }

  /**
   * AdminUser updateManyAndReturn
   */
  export type AdminUserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * The data used to update AdminUsers.
     */
    data: XOR<AdminUserUpdateManyMutationInput, AdminUserUncheckedUpdateManyInput>
    /**
     * Filter which AdminUsers to update
     */
    where?: AdminUserWhereInput
    /**
     * Limit how many AdminUsers to update.
     */
    limit?: number
  }

  /**
   * AdminUser upsert
   */
  export type AdminUserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * The filter to search for the AdminUser to update in case it exists.
     */
    where: AdminUserWhereUniqueInput
    /**
     * In case the AdminUser found by the `where` argument doesn't exist, create a new AdminUser with this data.
     */
    create: XOR<AdminUserCreateInput, AdminUserUncheckedCreateInput>
    /**
     * In case the AdminUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AdminUserUpdateInput, AdminUserUncheckedUpdateInput>
  }

  /**
   * AdminUser delete
   */
  export type AdminUserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
    /**
     * Filter which AdminUser to delete.
     */
    where: AdminUserWhereUniqueInput
  }

  /**
   * AdminUser deleteMany
   */
  export type AdminUserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdminUsers to delete
     */
    where?: AdminUserWhereInput
    /**
     * Limit how many AdminUsers to delete.
     */
    limit?: number
  }

  /**
   * AdminUser without action
   */
  export type AdminUserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminUser
     */
    select?: AdminUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminUser
     */
    omit?: AdminUserOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const SubstationScalarFieldEnum: {
    id: 'id',
    no: 'no',
    ulp: 'ulp',
    noGardu: 'noGardu',
    namaLokasiGardu: 'namaLokasiGardu',
    jenis: 'jenis',
    merek: 'merek',
    daya: 'daya',
    tahun: 'tahun',
    phasa: 'phasa',
    tap_trafo_max_tap: 'tap_trafo_max_tap',
    penyulang: 'penyulang',
    arahSequence: 'arahSequence',
    tanggal: 'tanggal',
    status: 'status',
    lastUpdate: 'lastUpdate',
    is_active: 'is_active',
    ugb: 'ugb',
    latitude: 'latitude',
    longitude: 'longitude'
  };

  export type SubstationScalarFieldEnum = (typeof SubstationScalarFieldEnum)[keyof typeof SubstationScalarFieldEnum]


  export const MeasurementSiangScalarFieldEnum: {
    id: 'id',
    substationId: 'substationId',
    month: 'month',
    r: 'r',
    s: 's',
    t: 't',
    n: 'n',
    rn: 'rn',
    sn: 'sn',
    tn: 'tn',
    pp: 'pp',
    pn: 'pn',
    row_name: 'row_name',
    rata2: 'rata2',
    kva: 'kva',
    persen: 'persen',
    unbalanced: 'unbalanced',
    lastUpdate: 'lastUpdate'
  };

  export type MeasurementSiangScalarFieldEnum = (typeof MeasurementSiangScalarFieldEnum)[keyof typeof MeasurementSiangScalarFieldEnum]


  export const MeasurementMalamScalarFieldEnum: {
    id: 'id',
    substationId: 'substationId',
    month: 'month',
    r: 'r',
    s: 's',
    t: 't',
    n: 'n',
    rn: 'rn',
    sn: 'sn',
    tn: 'tn',
    pp: 'pp',
    pn: 'pn',
    row_name: 'row_name',
    rata2: 'rata2',
    kva: 'kva',
    persen: 'persen',
    unbalanced: 'unbalanced',
    lastUpdate: 'lastUpdate'
  };

  export type MeasurementMalamScalarFieldEnum = (typeof MeasurementMalamScalarFieldEnum)[keyof typeof MeasurementMalamScalarFieldEnum]


  export const AdminUserScalarFieldEnum: {
    id: 'id',
    username: 'username',
    password_hash: 'password_hash',
    role: 'role',
    created_at: 'created_at'
  };

  export type AdminUserScalarFieldEnum = (typeof AdminUserScalarFieldEnum)[keyof typeof AdminUserScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type SubstationWhereInput = {
    AND?: SubstationWhereInput | SubstationWhereInput[]
    OR?: SubstationWhereInput[]
    NOT?: SubstationWhereInput | SubstationWhereInput[]
    id?: StringFilter<"Substation"> | string
    no?: IntFilter<"Substation"> | number
    ulp?: StringFilter<"Substation"> | string
    noGardu?: StringFilter<"Substation"> | string
    namaLokasiGardu?: StringFilter<"Substation"> | string
    jenis?: StringFilter<"Substation"> | string
    merek?: StringFilter<"Substation"> | string
    daya?: StringFilter<"Substation"> | string
    tahun?: StringFilter<"Substation"> | string
    phasa?: StringFilter<"Substation"> | string
    tap_trafo_max_tap?: StringFilter<"Substation"> | string
    penyulang?: StringFilter<"Substation"> | string
    arahSequence?: StringFilter<"Substation"> | string
    tanggal?: DateTimeFilter<"Substation"> | Date | string
    status?: StringFilter<"Substation"> | string
    lastUpdate?: DateTimeFilter<"Substation"> | Date | string
    is_active?: IntFilter<"Substation"> | number
    ugb?: IntFilter<"Substation"> | number
    latitude?: FloatNullableFilter<"Substation"> | number | null
    longitude?: FloatNullableFilter<"Substation"> | number | null
    measurements_siang?: MeasurementSiangListRelationFilter
    measurements_malam?: MeasurementMalamListRelationFilter
  }

  export type SubstationOrderByWithRelationInput = {
    id?: SortOrder
    no?: SortOrder
    ulp?: SortOrder
    noGardu?: SortOrder
    namaLokasiGardu?: SortOrder
    jenis?: SortOrder
    merek?: SortOrder
    daya?: SortOrder
    tahun?: SortOrder
    phasa?: SortOrder
    tap_trafo_max_tap?: SortOrder
    penyulang?: SortOrder
    arahSequence?: SortOrder
    tanggal?: SortOrder
    status?: SortOrder
    lastUpdate?: SortOrder
    is_active?: SortOrder
    ugb?: SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    measurements_siang?: MeasurementSiangOrderByRelationAggregateInput
    measurements_malam?: MeasurementMalamOrderByRelationAggregateInput
  }

  export type SubstationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SubstationWhereInput | SubstationWhereInput[]
    OR?: SubstationWhereInput[]
    NOT?: SubstationWhereInput | SubstationWhereInput[]
    no?: IntFilter<"Substation"> | number
    ulp?: StringFilter<"Substation"> | string
    noGardu?: StringFilter<"Substation"> | string
    namaLokasiGardu?: StringFilter<"Substation"> | string
    jenis?: StringFilter<"Substation"> | string
    merek?: StringFilter<"Substation"> | string
    daya?: StringFilter<"Substation"> | string
    tahun?: StringFilter<"Substation"> | string
    phasa?: StringFilter<"Substation"> | string
    tap_trafo_max_tap?: StringFilter<"Substation"> | string
    penyulang?: StringFilter<"Substation"> | string
    arahSequence?: StringFilter<"Substation"> | string
    tanggal?: DateTimeFilter<"Substation"> | Date | string
    status?: StringFilter<"Substation"> | string
    lastUpdate?: DateTimeFilter<"Substation"> | Date | string
    is_active?: IntFilter<"Substation"> | number
    ugb?: IntFilter<"Substation"> | number
    latitude?: FloatNullableFilter<"Substation"> | number | null
    longitude?: FloatNullableFilter<"Substation"> | number | null
    measurements_siang?: MeasurementSiangListRelationFilter
    measurements_malam?: MeasurementMalamListRelationFilter
  }, "id">

  export type SubstationOrderByWithAggregationInput = {
    id?: SortOrder
    no?: SortOrder
    ulp?: SortOrder
    noGardu?: SortOrder
    namaLokasiGardu?: SortOrder
    jenis?: SortOrder
    merek?: SortOrder
    daya?: SortOrder
    tahun?: SortOrder
    phasa?: SortOrder
    tap_trafo_max_tap?: SortOrder
    penyulang?: SortOrder
    arahSequence?: SortOrder
    tanggal?: SortOrder
    status?: SortOrder
    lastUpdate?: SortOrder
    is_active?: SortOrder
    ugb?: SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    _count?: SubstationCountOrderByAggregateInput
    _avg?: SubstationAvgOrderByAggregateInput
    _max?: SubstationMaxOrderByAggregateInput
    _min?: SubstationMinOrderByAggregateInput
    _sum?: SubstationSumOrderByAggregateInput
  }

  export type SubstationScalarWhereWithAggregatesInput = {
    AND?: SubstationScalarWhereWithAggregatesInput | SubstationScalarWhereWithAggregatesInput[]
    OR?: SubstationScalarWhereWithAggregatesInput[]
    NOT?: SubstationScalarWhereWithAggregatesInput | SubstationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Substation"> | string
    no?: IntWithAggregatesFilter<"Substation"> | number
    ulp?: StringWithAggregatesFilter<"Substation"> | string
    noGardu?: StringWithAggregatesFilter<"Substation"> | string
    namaLokasiGardu?: StringWithAggregatesFilter<"Substation"> | string
    jenis?: StringWithAggregatesFilter<"Substation"> | string
    merek?: StringWithAggregatesFilter<"Substation"> | string
    daya?: StringWithAggregatesFilter<"Substation"> | string
    tahun?: StringWithAggregatesFilter<"Substation"> | string
    phasa?: StringWithAggregatesFilter<"Substation"> | string
    tap_trafo_max_tap?: StringWithAggregatesFilter<"Substation"> | string
    penyulang?: StringWithAggregatesFilter<"Substation"> | string
    arahSequence?: StringWithAggregatesFilter<"Substation"> | string
    tanggal?: DateTimeWithAggregatesFilter<"Substation"> | Date | string
    status?: StringWithAggregatesFilter<"Substation"> | string
    lastUpdate?: DateTimeWithAggregatesFilter<"Substation"> | Date | string
    is_active?: IntWithAggregatesFilter<"Substation"> | number
    ugb?: IntWithAggregatesFilter<"Substation"> | number
    latitude?: FloatNullableWithAggregatesFilter<"Substation"> | number | null
    longitude?: FloatNullableWithAggregatesFilter<"Substation"> | number | null
  }

  export type MeasurementSiangWhereInput = {
    AND?: MeasurementSiangWhereInput | MeasurementSiangWhereInput[]
    OR?: MeasurementSiangWhereInput[]
    NOT?: MeasurementSiangWhereInput | MeasurementSiangWhereInput[]
    id?: IntFilter<"MeasurementSiang"> | number
    substationId?: StringFilter<"MeasurementSiang"> | string
    month?: StringFilter<"MeasurementSiang"> | string
    r?: FloatFilter<"MeasurementSiang"> | number
    s?: FloatFilter<"MeasurementSiang"> | number
    t?: FloatFilter<"MeasurementSiang"> | number
    n?: FloatFilter<"MeasurementSiang"> | number
    rn?: FloatFilter<"MeasurementSiang"> | number
    sn?: FloatFilter<"MeasurementSiang"> | number
    tn?: FloatFilter<"MeasurementSiang"> | number
    pp?: FloatFilter<"MeasurementSiang"> | number
    pn?: FloatFilter<"MeasurementSiang"> | number
    row_name?: StringFilter<"MeasurementSiang"> | string
    rata2?: FloatNullableFilter<"MeasurementSiang"> | number | null
    kva?: FloatNullableFilter<"MeasurementSiang"> | number | null
    persen?: FloatNullableFilter<"MeasurementSiang"> | number | null
    unbalanced?: FloatNullableFilter<"MeasurementSiang"> | number | null
    lastUpdate?: DateTimeFilter<"MeasurementSiang"> | Date | string
    substation?: XOR<SubstationScalarRelationFilter, SubstationWhereInput>
  }

  export type MeasurementSiangOrderByWithRelationInput = {
    id?: SortOrder
    substationId?: SortOrder
    month?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    row_name?: SortOrder
    rata2?: SortOrderInput | SortOrder
    kva?: SortOrderInput | SortOrder
    persen?: SortOrderInput | SortOrder
    unbalanced?: SortOrderInput | SortOrder
    lastUpdate?: SortOrder
    substation?: SubstationOrderByWithRelationInput
  }

  export type MeasurementSiangWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    substationId_month_row_name?: MeasurementSiangSubstationIdMonthRow_nameCompoundUniqueInput
    AND?: MeasurementSiangWhereInput | MeasurementSiangWhereInput[]
    OR?: MeasurementSiangWhereInput[]
    NOT?: MeasurementSiangWhereInput | MeasurementSiangWhereInput[]
    substationId?: StringFilter<"MeasurementSiang"> | string
    month?: StringFilter<"MeasurementSiang"> | string
    r?: FloatFilter<"MeasurementSiang"> | number
    s?: FloatFilter<"MeasurementSiang"> | number
    t?: FloatFilter<"MeasurementSiang"> | number
    n?: FloatFilter<"MeasurementSiang"> | number
    rn?: FloatFilter<"MeasurementSiang"> | number
    sn?: FloatFilter<"MeasurementSiang"> | number
    tn?: FloatFilter<"MeasurementSiang"> | number
    pp?: FloatFilter<"MeasurementSiang"> | number
    pn?: FloatFilter<"MeasurementSiang"> | number
    row_name?: StringFilter<"MeasurementSiang"> | string
    rata2?: FloatNullableFilter<"MeasurementSiang"> | number | null
    kva?: FloatNullableFilter<"MeasurementSiang"> | number | null
    persen?: FloatNullableFilter<"MeasurementSiang"> | number | null
    unbalanced?: FloatNullableFilter<"MeasurementSiang"> | number | null
    lastUpdate?: DateTimeFilter<"MeasurementSiang"> | Date | string
    substation?: XOR<SubstationScalarRelationFilter, SubstationWhereInput>
  }, "id" | "substationId_month_row_name">

  export type MeasurementSiangOrderByWithAggregationInput = {
    id?: SortOrder
    substationId?: SortOrder
    month?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    row_name?: SortOrder
    rata2?: SortOrderInput | SortOrder
    kva?: SortOrderInput | SortOrder
    persen?: SortOrderInput | SortOrder
    unbalanced?: SortOrderInput | SortOrder
    lastUpdate?: SortOrder
    _count?: MeasurementSiangCountOrderByAggregateInput
    _avg?: MeasurementSiangAvgOrderByAggregateInput
    _max?: MeasurementSiangMaxOrderByAggregateInput
    _min?: MeasurementSiangMinOrderByAggregateInput
    _sum?: MeasurementSiangSumOrderByAggregateInput
  }

  export type MeasurementSiangScalarWhereWithAggregatesInput = {
    AND?: MeasurementSiangScalarWhereWithAggregatesInput | MeasurementSiangScalarWhereWithAggregatesInput[]
    OR?: MeasurementSiangScalarWhereWithAggregatesInput[]
    NOT?: MeasurementSiangScalarWhereWithAggregatesInput | MeasurementSiangScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"MeasurementSiang"> | number
    substationId?: StringWithAggregatesFilter<"MeasurementSiang"> | string
    month?: StringWithAggregatesFilter<"MeasurementSiang"> | string
    r?: FloatWithAggregatesFilter<"MeasurementSiang"> | number
    s?: FloatWithAggregatesFilter<"MeasurementSiang"> | number
    t?: FloatWithAggregatesFilter<"MeasurementSiang"> | number
    n?: FloatWithAggregatesFilter<"MeasurementSiang"> | number
    rn?: FloatWithAggregatesFilter<"MeasurementSiang"> | number
    sn?: FloatWithAggregatesFilter<"MeasurementSiang"> | number
    tn?: FloatWithAggregatesFilter<"MeasurementSiang"> | number
    pp?: FloatWithAggregatesFilter<"MeasurementSiang"> | number
    pn?: FloatWithAggregatesFilter<"MeasurementSiang"> | number
    row_name?: StringWithAggregatesFilter<"MeasurementSiang"> | string
    rata2?: FloatNullableWithAggregatesFilter<"MeasurementSiang"> | number | null
    kva?: FloatNullableWithAggregatesFilter<"MeasurementSiang"> | number | null
    persen?: FloatNullableWithAggregatesFilter<"MeasurementSiang"> | number | null
    unbalanced?: FloatNullableWithAggregatesFilter<"MeasurementSiang"> | number | null
    lastUpdate?: DateTimeWithAggregatesFilter<"MeasurementSiang"> | Date | string
  }

  export type MeasurementMalamWhereInput = {
    AND?: MeasurementMalamWhereInput | MeasurementMalamWhereInput[]
    OR?: MeasurementMalamWhereInput[]
    NOT?: MeasurementMalamWhereInput | MeasurementMalamWhereInput[]
    id?: IntFilter<"MeasurementMalam"> | number
    substationId?: StringFilter<"MeasurementMalam"> | string
    month?: StringFilter<"MeasurementMalam"> | string
    r?: FloatFilter<"MeasurementMalam"> | number
    s?: FloatFilter<"MeasurementMalam"> | number
    t?: FloatFilter<"MeasurementMalam"> | number
    n?: FloatFilter<"MeasurementMalam"> | number
    rn?: FloatFilter<"MeasurementMalam"> | number
    sn?: FloatFilter<"MeasurementMalam"> | number
    tn?: FloatFilter<"MeasurementMalam"> | number
    pp?: FloatFilter<"MeasurementMalam"> | number
    pn?: FloatFilter<"MeasurementMalam"> | number
    row_name?: StringFilter<"MeasurementMalam"> | string
    rata2?: FloatNullableFilter<"MeasurementMalam"> | number | null
    kva?: FloatNullableFilter<"MeasurementMalam"> | number | null
    persen?: FloatNullableFilter<"MeasurementMalam"> | number | null
    unbalanced?: FloatNullableFilter<"MeasurementMalam"> | number | null
    lastUpdate?: DateTimeFilter<"MeasurementMalam"> | Date | string
    substation?: XOR<SubstationScalarRelationFilter, SubstationWhereInput>
  }

  export type MeasurementMalamOrderByWithRelationInput = {
    id?: SortOrder
    substationId?: SortOrder
    month?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    row_name?: SortOrder
    rata2?: SortOrderInput | SortOrder
    kva?: SortOrderInput | SortOrder
    persen?: SortOrderInput | SortOrder
    unbalanced?: SortOrderInput | SortOrder
    lastUpdate?: SortOrder
    substation?: SubstationOrderByWithRelationInput
  }

  export type MeasurementMalamWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    substationId_month_row_name?: MeasurementMalamSubstationIdMonthRow_nameCompoundUniqueInput
    AND?: MeasurementMalamWhereInput | MeasurementMalamWhereInput[]
    OR?: MeasurementMalamWhereInput[]
    NOT?: MeasurementMalamWhereInput | MeasurementMalamWhereInput[]
    substationId?: StringFilter<"MeasurementMalam"> | string
    month?: StringFilter<"MeasurementMalam"> | string
    r?: FloatFilter<"MeasurementMalam"> | number
    s?: FloatFilter<"MeasurementMalam"> | number
    t?: FloatFilter<"MeasurementMalam"> | number
    n?: FloatFilter<"MeasurementMalam"> | number
    rn?: FloatFilter<"MeasurementMalam"> | number
    sn?: FloatFilter<"MeasurementMalam"> | number
    tn?: FloatFilter<"MeasurementMalam"> | number
    pp?: FloatFilter<"MeasurementMalam"> | number
    pn?: FloatFilter<"MeasurementMalam"> | number
    row_name?: StringFilter<"MeasurementMalam"> | string
    rata2?: FloatNullableFilter<"MeasurementMalam"> | number | null
    kva?: FloatNullableFilter<"MeasurementMalam"> | number | null
    persen?: FloatNullableFilter<"MeasurementMalam"> | number | null
    unbalanced?: FloatNullableFilter<"MeasurementMalam"> | number | null
    lastUpdate?: DateTimeFilter<"MeasurementMalam"> | Date | string
    substation?: XOR<SubstationScalarRelationFilter, SubstationWhereInput>
  }, "id" | "substationId_month_row_name">

  export type MeasurementMalamOrderByWithAggregationInput = {
    id?: SortOrder
    substationId?: SortOrder
    month?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    row_name?: SortOrder
    rata2?: SortOrderInput | SortOrder
    kva?: SortOrderInput | SortOrder
    persen?: SortOrderInput | SortOrder
    unbalanced?: SortOrderInput | SortOrder
    lastUpdate?: SortOrder
    _count?: MeasurementMalamCountOrderByAggregateInput
    _avg?: MeasurementMalamAvgOrderByAggregateInput
    _max?: MeasurementMalamMaxOrderByAggregateInput
    _min?: MeasurementMalamMinOrderByAggregateInput
    _sum?: MeasurementMalamSumOrderByAggregateInput
  }

  export type MeasurementMalamScalarWhereWithAggregatesInput = {
    AND?: MeasurementMalamScalarWhereWithAggregatesInput | MeasurementMalamScalarWhereWithAggregatesInput[]
    OR?: MeasurementMalamScalarWhereWithAggregatesInput[]
    NOT?: MeasurementMalamScalarWhereWithAggregatesInput | MeasurementMalamScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"MeasurementMalam"> | number
    substationId?: StringWithAggregatesFilter<"MeasurementMalam"> | string
    month?: StringWithAggregatesFilter<"MeasurementMalam"> | string
    r?: FloatWithAggregatesFilter<"MeasurementMalam"> | number
    s?: FloatWithAggregatesFilter<"MeasurementMalam"> | number
    t?: FloatWithAggregatesFilter<"MeasurementMalam"> | number
    n?: FloatWithAggregatesFilter<"MeasurementMalam"> | number
    rn?: FloatWithAggregatesFilter<"MeasurementMalam"> | number
    sn?: FloatWithAggregatesFilter<"MeasurementMalam"> | number
    tn?: FloatWithAggregatesFilter<"MeasurementMalam"> | number
    pp?: FloatWithAggregatesFilter<"MeasurementMalam"> | number
    pn?: FloatWithAggregatesFilter<"MeasurementMalam"> | number
    row_name?: StringWithAggregatesFilter<"MeasurementMalam"> | string
    rata2?: FloatNullableWithAggregatesFilter<"MeasurementMalam"> | number | null
    kva?: FloatNullableWithAggregatesFilter<"MeasurementMalam"> | number | null
    persen?: FloatNullableWithAggregatesFilter<"MeasurementMalam"> | number | null
    unbalanced?: FloatNullableWithAggregatesFilter<"MeasurementMalam"> | number | null
    lastUpdate?: DateTimeWithAggregatesFilter<"MeasurementMalam"> | Date | string
  }

  export type AdminUserWhereInput = {
    AND?: AdminUserWhereInput | AdminUserWhereInput[]
    OR?: AdminUserWhereInput[]
    NOT?: AdminUserWhereInput | AdminUserWhereInput[]
    id?: IntFilter<"AdminUser"> | number
    username?: StringFilter<"AdminUser"> | string
    password_hash?: StringFilter<"AdminUser"> | string
    role?: StringFilter<"AdminUser"> | string
    created_at?: DateTimeFilter<"AdminUser"> | Date | string
  }

  export type AdminUserOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    password_hash?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
  }

  export type AdminUserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    username?: string
    AND?: AdminUserWhereInput | AdminUserWhereInput[]
    OR?: AdminUserWhereInput[]
    NOT?: AdminUserWhereInput | AdminUserWhereInput[]
    password_hash?: StringFilter<"AdminUser"> | string
    role?: StringFilter<"AdminUser"> | string
    created_at?: DateTimeFilter<"AdminUser"> | Date | string
  }, "id" | "username">

  export type AdminUserOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    password_hash?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
    _count?: AdminUserCountOrderByAggregateInput
    _avg?: AdminUserAvgOrderByAggregateInput
    _max?: AdminUserMaxOrderByAggregateInput
    _min?: AdminUserMinOrderByAggregateInput
    _sum?: AdminUserSumOrderByAggregateInput
  }

  export type AdminUserScalarWhereWithAggregatesInput = {
    AND?: AdminUserScalarWhereWithAggregatesInput | AdminUserScalarWhereWithAggregatesInput[]
    OR?: AdminUserScalarWhereWithAggregatesInput[]
    NOT?: AdminUserScalarWhereWithAggregatesInput | AdminUserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AdminUser"> | number
    username?: StringWithAggregatesFilter<"AdminUser"> | string
    password_hash?: StringWithAggregatesFilter<"AdminUser"> | string
    role?: StringWithAggregatesFilter<"AdminUser"> | string
    created_at?: DateTimeWithAggregatesFilter<"AdminUser"> | Date | string
  }

  export type SubstationCreateInput = {
    id?: string
    no: number
    ulp: string
    noGardu: string
    namaLokasiGardu: string
    jenis: string
    merek: string
    daya: string
    tahun: string
    phasa: string
    tap_trafo_max_tap: string
    penyulang: string
    arahSequence: string
    tanggal: Date | string
    status?: string
    lastUpdate?: Date | string
    is_active?: number
    ugb?: number
    latitude?: number | null
    longitude?: number | null
    measurements_siang?: MeasurementSiangCreateNestedManyWithoutSubstationInput
    measurements_malam?: MeasurementMalamCreateNestedManyWithoutSubstationInput
  }

  export type SubstationUncheckedCreateInput = {
    id?: string
    no: number
    ulp: string
    noGardu: string
    namaLokasiGardu: string
    jenis: string
    merek: string
    daya: string
    tahun: string
    phasa: string
    tap_trafo_max_tap: string
    penyulang: string
    arahSequence: string
    tanggal: Date | string
    status?: string
    lastUpdate?: Date | string
    is_active?: number
    ugb?: number
    latitude?: number | null
    longitude?: number | null
    measurements_siang?: MeasurementSiangUncheckedCreateNestedManyWithoutSubstationInput
    measurements_malam?: MeasurementMalamUncheckedCreateNestedManyWithoutSubstationInput
  }

  export type SubstationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    no?: IntFieldUpdateOperationsInput | number
    ulp?: StringFieldUpdateOperationsInput | string
    noGardu?: StringFieldUpdateOperationsInput | string
    namaLokasiGardu?: StringFieldUpdateOperationsInput | string
    jenis?: StringFieldUpdateOperationsInput | string
    merek?: StringFieldUpdateOperationsInput | string
    daya?: StringFieldUpdateOperationsInput | string
    tahun?: StringFieldUpdateOperationsInput | string
    phasa?: StringFieldUpdateOperationsInput | string
    tap_trafo_max_tap?: StringFieldUpdateOperationsInput | string
    penyulang?: StringFieldUpdateOperationsInput | string
    arahSequence?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: IntFieldUpdateOperationsInput | number
    ugb?: IntFieldUpdateOperationsInput | number
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    measurements_siang?: MeasurementSiangUpdateManyWithoutSubstationNestedInput
    measurements_malam?: MeasurementMalamUpdateManyWithoutSubstationNestedInput
  }

  export type SubstationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    no?: IntFieldUpdateOperationsInput | number
    ulp?: StringFieldUpdateOperationsInput | string
    noGardu?: StringFieldUpdateOperationsInput | string
    namaLokasiGardu?: StringFieldUpdateOperationsInput | string
    jenis?: StringFieldUpdateOperationsInput | string
    merek?: StringFieldUpdateOperationsInput | string
    daya?: StringFieldUpdateOperationsInput | string
    tahun?: StringFieldUpdateOperationsInput | string
    phasa?: StringFieldUpdateOperationsInput | string
    tap_trafo_max_tap?: StringFieldUpdateOperationsInput | string
    penyulang?: StringFieldUpdateOperationsInput | string
    arahSequence?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: IntFieldUpdateOperationsInput | number
    ugb?: IntFieldUpdateOperationsInput | number
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    measurements_siang?: MeasurementSiangUncheckedUpdateManyWithoutSubstationNestedInput
    measurements_malam?: MeasurementMalamUncheckedUpdateManyWithoutSubstationNestedInput
  }

  export type SubstationCreateManyInput = {
    id?: string
    no: number
    ulp: string
    noGardu: string
    namaLokasiGardu: string
    jenis: string
    merek: string
    daya: string
    tahun: string
    phasa: string
    tap_trafo_max_tap: string
    penyulang: string
    arahSequence: string
    tanggal: Date | string
    status?: string
    lastUpdate?: Date | string
    is_active?: number
    ugb?: number
    latitude?: number | null
    longitude?: number | null
  }

  export type SubstationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    no?: IntFieldUpdateOperationsInput | number
    ulp?: StringFieldUpdateOperationsInput | string
    noGardu?: StringFieldUpdateOperationsInput | string
    namaLokasiGardu?: StringFieldUpdateOperationsInput | string
    jenis?: StringFieldUpdateOperationsInput | string
    merek?: StringFieldUpdateOperationsInput | string
    daya?: StringFieldUpdateOperationsInput | string
    tahun?: StringFieldUpdateOperationsInput | string
    phasa?: StringFieldUpdateOperationsInput | string
    tap_trafo_max_tap?: StringFieldUpdateOperationsInput | string
    penyulang?: StringFieldUpdateOperationsInput | string
    arahSequence?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: IntFieldUpdateOperationsInput | number
    ugb?: IntFieldUpdateOperationsInput | number
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type SubstationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    no?: IntFieldUpdateOperationsInput | number
    ulp?: StringFieldUpdateOperationsInput | string
    noGardu?: StringFieldUpdateOperationsInput | string
    namaLokasiGardu?: StringFieldUpdateOperationsInput | string
    jenis?: StringFieldUpdateOperationsInput | string
    merek?: StringFieldUpdateOperationsInput | string
    daya?: StringFieldUpdateOperationsInput | string
    tahun?: StringFieldUpdateOperationsInput | string
    phasa?: StringFieldUpdateOperationsInput | string
    tap_trafo_max_tap?: StringFieldUpdateOperationsInput | string
    penyulang?: StringFieldUpdateOperationsInput | string
    arahSequence?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: IntFieldUpdateOperationsInput | number
    ugb?: IntFieldUpdateOperationsInput | number
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type MeasurementSiangCreateInput = {
    month: string
    r?: number
    s?: number
    t?: number
    n?: number
    rn?: number
    sn?: number
    tn?: number
    pp?: number
    pn?: number
    row_name: string
    rata2?: number | null
    kva?: number | null
    persen?: number | null
    unbalanced?: number | null
    lastUpdate?: Date | string
    substation: SubstationCreateNestedOneWithoutMeasurements_siangInput
  }

  export type MeasurementSiangUncheckedCreateInput = {
    id?: number
    substationId: string
    month: string
    r?: number
    s?: number
    t?: number
    n?: number
    rn?: number
    sn?: number
    tn?: number
    pp?: number
    pn?: number
    row_name: string
    rata2?: number | null
    kva?: number | null
    persen?: number | null
    unbalanced?: number | null
    lastUpdate?: Date | string
  }

  export type MeasurementSiangUpdateInput = {
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    substation?: SubstationUpdateOneRequiredWithoutMeasurements_siangNestedInput
  }

  export type MeasurementSiangUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    substationId?: StringFieldUpdateOperationsInput | string
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MeasurementSiangCreateManyInput = {
    id?: number
    substationId: string
    month: string
    r?: number
    s?: number
    t?: number
    n?: number
    rn?: number
    sn?: number
    tn?: number
    pp?: number
    pn?: number
    row_name: string
    rata2?: number | null
    kva?: number | null
    persen?: number | null
    unbalanced?: number | null
    lastUpdate?: Date | string
  }

  export type MeasurementSiangUpdateManyMutationInput = {
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MeasurementSiangUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    substationId?: StringFieldUpdateOperationsInput | string
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MeasurementMalamCreateInput = {
    month: string
    r?: number
    s?: number
    t?: number
    n?: number
    rn?: number
    sn?: number
    tn?: number
    pp?: number
    pn?: number
    row_name: string
    rata2?: number | null
    kva?: number | null
    persen?: number | null
    unbalanced?: number | null
    lastUpdate?: Date | string
    substation: SubstationCreateNestedOneWithoutMeasurements_malamInput
  }

  export type MeasurementMalamUncheckedCreateInput = {
    id?: number
    substationId: string
    month: string
    r?: number
    s?: number
    t?: number
    n?: number
    rn?: number
    sn?: number
    tn?: number
    pp?: number
    pn?: number
    row_name: string
    rata2?: number | null
    kva?: number | null
    persen?: number | null
    unbalanced?: number | null
    lastUpdate?: Date | string
  }

  export type MeasurementMalamUpdateInput = {
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    substation?: SubstationUpdateOneRequiredWithoutMeasurements_malamNestedInput
  }

  export type MeasurementMalamUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    substationId?: StringFieldUpdateOperationsInput | string
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MeasurementMalamCreateManyInput = {
    id?: number
    substationId: string
    month: string
    r?: number
    s?: number
    t?: number
    n?: number
    rn?: number
    sn?: number
    tn?: number
    pp?: number
    pn?: number
    row_name: string
    rata2?: number | null
    kva?: number | null
    persen?: number | null
    unbalanced?: number | null
    lastUpdate?: Date | string
  }

  export type MeasurementMalamUpdateManyMutationInput = {
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MeasurementMalamUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    substationId?: StringFieldUpdateOperationsInput | string
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminUserCreateInput = {
    username: string
    password_hash: string
    role?: string
    created_at?: Date | string
  }

  export type AdminUserUncheckedCreateInput = {
    id?: number
    username: string
    password_hash: string
    role?: string
    created_at?: Date | string
  }

  export type AdminUserUpdateInput = {
    username?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminUserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminUserCreateManyInput = {
    id?: number
    username: string
    password_hash: string
    role?: string
    created_at?: Date | string
  }

  export type AdminUserUpdateManyMutationInput = {
    username?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminUserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    password_hash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type MeasurementSiangListRelationFilter = {
    every?: MeasurementSiangWhereInput
    some?: MeasurementSiangWhereInput
    none?: MeasurementSiangWhereInput
  }

  export type MeasurementMalamListRelationFilter = {
    every?: MeasurementMalamWhereInput
    some?: MeasurementMalamWhereInput
    none?: MeasurementMalamWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type MeasurementSiangOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MeasurementMalamOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SubstationCountOrderByAggregateInput = {
    id?: SortOrder
    no?: SortOrder
    ulp?: SortOrder
    noGardu?: SortOrder
    namaLokasiGardu?: SortOrder
    jenis?: SortOrder
    merek?: SortOrder
    daya?: SortOrder
    tahun?: SortOrder
    phasa?: SortOrder
    tap_trafo_max_tap?: SortOrder
    penyulang?: SortOrder
    arahSequence?: SortOrder
    tanggal?: SortOrder
    status?: SortOrder
    lastUpdate?: SortOrder
    is_active?: SortOrder
    ugb?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type SubstationAvgOrderByAggregateInput = {
    no?: SortOrder
    is_active?: SortOrder
    ugb?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type SubstationMaxOrderByAggregateInput = {
    id?: SortOrder
    no?: SortOrder
    ulp?: SortOrder
    noGardu?: SortOrder
    namaLokasiGardu?: SortOrder
    jenis?: SortOrder
    merek?: SortOrder
    daya?: SortOrder
    tahun?: SortOrder
    phasa?: SortOrder
    tap_trafo_max_tap?: SortOrder
    penyulang?: SortOrder
    arahSequence?: SortOrder
    tanggal?: SortOrder
    status?: SortOrder
    lastUpdate?: SortOrder
    is_active?: SortOrder
    ugb?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type SubstationMinOrderByAggregateInput = {
    id?: SortOrder
    no?: SortOrder
    ulp?: SortOrder
    noGardu?: SortOrder
    namaLokasiGardu?: SortOrder
    jenis?: SortOrder
    merek?: SortOrder
    daya?: SortOrder
    tahun?: SortOrder
    phasa?: SortOrder
    tap_trafo_max_tap?: SortOrder
    penyulang?: SortOrder
    arahSequence?: SortOrder
    tanggal?: SortOrder
    status?: SortOrder
    lastUpdate?: SortOrder
    is_active?: SortOrder
    ugb?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type SubstationSumOrderByAggregateInput = {
    no?: SortOrder
    is_active?: SortOrder
    ugb?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type SubstationScalarRelationFilter = {
    is?: SubstationWhereInput
    isNot?: SubstationWhereInput
  }

  export type MeasurementSiangSubstationIdMonthRow_nameCompoundUniqueInput = {
    substationId: string
    month: string
    row_name: string
  }

  export type MeasurementSiangCountOrderByAggregateInput = {
    id?: SortOrder
    substationId?: SortOrder
    month?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    row_name?: SortOrder
    rata2?: SortOrder
    kva?: SortOrder
    persen?: SortOrder
    unbalanced?: SortOrder
    lastUpdate?: SortOrder
  }

  export type MeasurementSiangAvgOrderByAggregateInput = {
    id?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    rata2?: SortOrder
    kva?: SortOrder
    persen?: SortOrder
    unbalanced?: SortOrder
  }

  export type MeasurementSiangMaxOrderByAggregateInput = {
    id?: SortOrder
    substationId?: SortOrder
    month?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    row_name?: SortOrder
    rata2?: SortOrder
    kva?: SortOrder
    persen?: SortOrder
    unbalanced?: SortOrder
    lastUpdate?: SortOrder
  }

  export type MeasurementSiangMinOrderByAggregateInput = {
    id?: SortOrder
    substationId?: SortOrder
    month?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    row_name?: SortOrder
    rata2?: SortOrder
    kva?: SortOrder
    persen?: SortOrder
    unbalanced?: SortOrder
    lastUpdate?: SortOrder
  }

  export type MeasurementSiangSumOrderByAggregateInput = {
    id?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    rata2?: SortOrder
    kva?: SortOrder
    persen?: SortOrder
    unbalanced?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type MeasurementMalamSubstationIdMonthRow_nameCompoundUniqueInput = {
    substationId: string
    month: string
    row_name: string
  }

  export type MeasurementMalamCountOrderByAggregateInput = {
    id?: SortOrder
    substationId?: SortOrder
    month?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    row_name?: SortOrder
    rata2?: SortOrder
    kva?: SortOrder
    persen?: SortOrder
    unbalanced?: SortOrder
    lastUpdate?: SortOrder
  }

  export type MeasurementMalamAvgOrderByAggregateInput = {
    id?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    rata2?: SortOrder
    kva?: SortOrder
    persen?: SortOrder
    unbalanced?: SortOrder
  }

  export type MeasurementMalamMaxOrderByAggregateInput = {
    id?: SortOrder
    substationId?: SortOrder
    month?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    row_name?: SortOrder
    rata2?: SortOrder
    kva?: SortOrder
    persen?: SortOrder
    unbalanced?: SortOrder
    lastUpdate?: SortOrder
  }

  export type MeasurementMalamMinOrderByAggregateInput = {
    id?: SortOrder
    substationId?: SortOrder
    month?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    row_name?: SortOrder
    rata2?: SortOrder
    kva?: SortOrder
    persen?: SortOrder
    unbalanced?: SortOrder
    lastUpdate?: SortOrder
  }

  export type MeasurementMalamSumOrderByAggregateInput = {
    id?: SortOrder
    r?: SortOrder
    s?: SortOrder
    t?: SortOrder
    n?: SortOrder
    rn?: SortOrder
    sn?: SortOrder
    tn?: SortOrder
    pp?: SortOrder
    pn?: SortOrder
    rata2?: SortOrder
    kva?: SortOrder
    persen?: SortOrder
    unbalanced?: SortOrder
  }

  export type AdminUserCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password_hash?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
  }

  export type AdminUserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AdminUserMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password_hash?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
  }

  export type AdminUserMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    password_hash?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
  }

  export type AdminUserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type MeasurementSiangCreateNestedManyWithoutSubstationInput = {
    create?: XOR<MeasurementSiangCreateWithoutSubstationInput, MeasurementSiangUncheckedCreateWithoutSubstationInput> | MeasurementSiangCreateWithoutSubstationInput[] | MeasurementSiangUncheckedCreateWithoutSubstationInput[]
    connectOrCreate?: MeasurementSiangCreateOrConnectWithoutSubstationInput | MeasurementSiangCreateOrConnectWithoutSubstationInput[]
    createMany?: MeasurementSiangCreateManySubstationInputEnvelope
    connect?: MeasurementSiangWhereUniqueInput | MeasurementSiangWhereUniqueInput[]
  }

  export type MeasurementMalamCreateNestedManyWithoutSubstationInput = {
    create?: XOR<MeasurementMalamCreateWithoutSubstationInput, MeasurementMalamUncheckedCreateWithoutSubstationInput> | MeasurementMalamCreateWithoutSubstationInput[] | MeasurementMalamUncheckedCreateWithoutSubstationInput[]
    connectOrCreate?: MeasurementMalamCreateOrConnectWithoutSubstationInput | MeasurementMalamCreateOrConnectWithoutSubstationInput[]
    createMany?: MeasurementMalamCreateManySubstationInputEnvelope
    connect?: MeasurementMalamWhereUniqueInput | MeasurementMalamWhereUniqueInput[]
  }

  export type MeasurementSiangUncheckedCreateNestedManyWithoutSubstationInput = {
    create?: XOR<MeasurementSiangCreateWithoutSubstationInput, MeasurementSiangUncheckedCreateWithoutSubstationInput> | MeasurementSiangCreateWithoutSubstationInput[] | MeasurementSiangUncheckedCreateWithoutSubstationInput[]
    connectOrCreate?: MeasurementSiangCreateOrConnectWithoutSubstationInput | MeasurementSiangCreateOrConnectWithoutSubstationInput[]
    createMany?: MeasurementSiangCreateManySubstationInputEnvelope
    connect?: MeasurementSiangWhereUniqueInput | MeasurementSiangWhereUniqueInput[]
  }

  export type MeasurementMalamUncheckedCreateNestedManyWithoutSubstationInput = {
    create?: XOR<MeasurementMalamCreateWithoutSubstationInput, MeasurementMalamUncheckedCreateWithoutSubstationInput> | MeasurementMalamCreateWithoutSubstationInput[] | MeasurementMalamUncheckedCreateWithoutSubstationInput[]
    connectOrCreate?: MeasurementMalamCreateOrConnectWithoutSubstationInput | MeasurementMalamCreateOrConnectWithoutSubstationInput[]
    createMany?: MeasurementMalamCreateManySubstationInputEnvelope
    connect?: MeasurementMalamWhereUniqueInput | MeasurementMalamWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type MeasurementSiangUpdateManyWithoutSubstationNestedInput = {
    create?: XOR<MeasurementSiangCreateWithoutSubstationInput, MeasurementSiangUncheckedCreateWithoutSubstationInput> | MeasurementSiangCreateWithoutSubstationInput[] | MeasurementSiangUncheckedCreateWithoutSubstationInput[]
    connectOrCreate?: MeasurementSiangCreateOrConnectWithoutSubstationInput | MeasurementSiangCreateOrConnectWithoutSubstationInput[]
    upsert?: MeasurementSiangUpsertWithWhereUniqueWithoutSubstationInput | MeasurementSiangUpsertWithWhereUniqueWithoutSubstationInput[]
    createMany?: MeasurementSiangCreateManySubstationInputEnvelope
    set?: MeasurementSiangWhereUniqueInput | MeasurementSiangWhereUniqueInput[]
    disconnect?: MeasurementSiangWhereUniqueInput | MeasurementSiangWhereUniqueInput[]
    delete?: MeasurementSiangWhereUniqueInput | MeasurementSiangWhereUniqueInput[]
    connect?: MeasurementSiangWhereUniqueInput | MeasurementSiangWhereUniqueInput[]
    update?: MeasurementSiangUpdateWithWhereUniqueWithoutSubstationInput | MeasurementSiangUpdateWithWhereUniqueWithoutSubstationInput[]
    updateMany?: MeasurementSiangUpdateManyWithWhereWithoutSubstationInput | MeasurementSiangUpdateManyWithWhereWithoutSubstationInput[]
    deleteMany?: MeasurementSiangScalarWhereInput | MeasurementSiangScalarWhereInput[]
  }

  export type MeasurementMalamUpdateManyWithoutSubstationNestedInput = {
    create?: XOR<MeasurementMalamCreateWithoutSubstationInput, MeasurementMalamUncheckedCreateWithoutSubstationInput> | MeasurementMalamCreateWithoutSubstationInput[] | MeasurementMalamUncheckedCreateWithoutSubstationInput[]
    connectOrCreate?: MeasurementMalamCreateOrConnectWithoutSubstationInput | MeasurementMalamCreateOrConnectWithoutSubstationInput[]
    upsert?: MeasurementMalamUpsertWithWhereUniqueWithoutSubstationInput | MeasurementMalamUpsertWithWhereUniqueWithoutSubstationInput[]
    createMany?: MeasurementMalamCreateManySubstationInputEnvelope
    set?: MeasurementMalamWhereUniqueInput | MeasurementMalamWhereUniqueInput[]
    disconnect?: MeasurementMalamWhereUniqueInput | MeasurementMalamWhereUniqueInput[]
    delete?: MeasurementMalamWhereUniqueInput | MeasurementMalamWhereUniqueInput[]
    connect?: MeasurementMalamWhereUniqueInput | MeasurementMalamWhereUniqueInput[]
    update?: MeasurementMalamUpdateWithWhereUniqueWithoutSubstationInput | MeasurementMalamUpdateWithWhereUniqueWithoutSubstationInput[]
    updateMany?: MeasurementMalamUpdateManyWithWhereWithoutSubstationInput | MeasurementMalamUpdateManyWithWhereWithoutSubstationInput[]
    deleteMany?: MeasurementMalamScalarWhereInput | MeasurementMalamScalarWhereInput[]
  }

  export type MeasurementSiangUncheckedUpdateManyWithoutSubstationNestedInput = {
    create?: XOR<MeasurementSiangCreateWithoutSubstationInput, MeasurementSiangUncheckedCreateWithoutSubstationInput> | MeasurementSiangCreateWithoutSubstationInput[] | MeasurementSiangUncheckedCreateWithoutSubstationInput[]
    connectOrCreate?: MeasurementSiangCreateOrConnectWithoutSubstationInput | MeasurementSiangCreateOrConnectWithoutSubstationInput[]
    upsert?: MeasurementSiangUpsertWithWhereUniqueWithoutSubstationInput | MeasurementSiangUpsertWithWhereUniqueWithoutSubstationInput[]
    createMany?: MeasurementSiangCreateManySubstationInputEnvelope
    set?: MeasurementSiangWhereUniqueInput | MeasurementSiangWhereUniqueInput[]
    disconnect?: MeasurementSiangWhereUniqueInput | MeasurementSiangWhereUniqueInput[]
    delete?: MeasurementSiangWhereUniqueInput | MeasurementSiangWhereUniqueInput[]
    connect?: MeasurementSiangWhereUniqueInput | MeasurementSiangWhereUniqueInput[]
    update?: MeasurementSiangUpdateWithWhereUniqueWithoutSubstationInput | MeasurementSiangUpdateWithWhereUniqueWithoutSubstationInput[]
    updateMany?: MeasurementSiangUpdateManyWithWhereWithoutSubstationInput | MeasurementSiangUpdateManyWithWhereWithoutSubstationInput[]
    deleteMany?: MeasurementSiangScalarWhereInput | MeasurementSiangScalarWhereInput[]
  }

  export type MeasurementMalamUncheckedUpdateManyWithoutSubstationNestedInput = {
    create?: XOR<MeasurementMalamCreateWithoutSubstationInput, MeasurementMalamUncheckedCreateWithoutSubstationInput> | MeasurementMalamCreateWithoutSubstationInput[] | MeasurementMalamUncheckedCreateWithoutSubstationInput[]
    connectOrCreate?: MeasurementMalamCreateOrConnectWithoutSubstationInput | MeasurementMalamCreateOrConnectWithoutSubstationInput[]
    upsert?: MeasurementMalamUpsertWithWhereUniqueWithoutSubstationInput | MeasurementMalamUpsertWithWhereUniqueWithoutSubstationInput[]
    createMany?: MeasurementMalamCreateManySubstationInputEnvelope
    set?: MeasurementMalamWhereUniqueInput | MeasurementMalamWhereUniqueInput[]
    disconnect?: MeasurementMalamWhereUniqueInput | MeasurementMalamWhereUniqueInput[]
    delete?: MeasurementMalamWhereUniqueInput | MeasurementMalamWhereUniqueInput[]
    connect?: MeasurementMalamWhereUniqueInput | MeasurementMalamWhereUniqueInput[]
    update?: MeasurementMalamUpdateWithWhereUniqueWithoutSubstationInput | MeasurementMalamUpdateWithWhereUniqueWithoutSubstationInput[]
    updateMany?: MeasurementMalamUpdateManyWithWhereWithoutSubstationInput | MeasurementMalamUpdateManyWithWhereWithoutSubstationInput[]
    deleteMany?: MeasurementMalamScalarWhereInput | MeasurementMalamScalarWhereInput[]
  }

  export type SubstationCreateNestedOneWithoutMeasurements_siangInput = {
    create?: XOR<SubstationCreateWithoutMeasurements_siangInput, SubstationUncheckedCreateWithoutMeasurements_siangInput>
    connectOrCreate?: SubstationCreateOrConnectWithoutMeasurements_siangInput
    connect?: SubstationWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SubstationUpdateOneRequiredWithoutMeasurements_siangNestedInput = {
    create?: XOR<SubstationCreateWithoutMeasurements_siangInput, SubstationUncheckedCreateWithoutMeasurements_siangInput>
    connectOrCreate?: SubstationCreateOrConnectWithoutMeasurements_siangInput
    upsert?: SubstationUpsertWithoutMeasurements_siangInput
    connect?: SubstationWhereUniqueInput
    update?: XOR<XOR<SubstationUpdateToOneWithWhereWithoutMeasurements_siangInput, SubstationUpdateWithoutMeasurements_siangInput>, SubstationUncheckedUpdateWithoutMeasurements_siangInput>
  }

  export type SubstationCreateNestedOneWithoutMeasurements_malamInput = {
    create?: XOR<SubstationCreateWithoutMeasurements_malamInput, SubstationUncheckedCreateWithoutMeasurements_malamInput>
    connectOrCreate?: SubstationCreateOrConnectWithoutMeasurements_malamInput
    connect?: SubstationWhereUniqueInput
  }

  export type SubstationUpdateOneRequiredWithoutMeasurements_malamNestedInput = {
    create?: XOR<SubstationCreateWithoutMeasurements_malamInput, SubstationUncheckedCreateWithoutMeasurements_malamInput>
    connectOrCreate?: SubstationCreateOrConnectWithoutMeasurements_malamInput
    upsert?: SubstationUpsertWithoutMeasurements_malamInput
    connect?: SubstationWhereUniqueInput
    update?: XOR<XOR<SubstationUpdateToOneWithWhereWithoutMeasurements_malamInput, SubstationUpdateWithoutMeasurements_malamInput>, SubstationUncheckedUpdateWithoutMeasurements_malamInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type MeasurementSiangCreateWithoutSubstationInput = {
    month: string
    r?: number
    s?: number
    t?: number
    n?: number
    rn?: number
    sn?: number
    tn?: number
    pp?: number
    pn?: number
    row_name: string
    rata2?: number | null
    kva?: number | null
    persen?: number | null
    unbalanced?: number | null
    lastUpdate?: Date | string
  }

  export type MeasurementSiangUncheckedCreateWithoutSubstationInput = {
    id?: number
    month: string
    r?: number
    s?: number
    t?: number
    n?: number
    rn?: number
    sn?: number
    tn?: number
    pp?: number
    pn?: number
    row_name: string
    rata2?: number | null
    kva?: number | null
    persen?: number | null
    unbalanced?: number | null
    lastUpdate?: Date | string
  }

  export type MeasurementSiangCreateOrConnectWithoutSubstationInput = {
    where: MeasurementSiangWhereUniqueInput
    create: XOR<MeasurementSiangCreateWithoutSubstationInput, MeasurementSiangUncheckedCreateWithoutSubstationInput>
  }

  export type MeasurementSiangCreateManySubstationInputEnvelope = {
    data: MeasurementSiangCreateManySubstationInput | MeasurementSiangCreateManySubstationInput[]
    skipDuplicates?: boolean
  }

  export type MeasurementMalamCreateWithoutSubstationInput = {
    month: string
    r?: number
    s?: number
    t?: number
    n?: number
    rn?: number
    sn?: number
    tn?: number
    pp?: number
    pn?: number
    row_name: string
    rata2?: number | null
    kva?: number | null
    persen?: number | null
    unbalanced?: number | null
    lastUpdate?: Date | string
  }

  export type MeasurementMalamUncheckedCreateWithoutSubstationInput = {
    id?: number
    month: string
    r?: number
    s?: number
    t?: number
    n?: number
    rn?: number
    sn?: number
    tn?: number
    pp?: number
    pn?: number
    row_name: string
    rata2?: number | null
    kva?: number | null
    persen?: number | null
    unbalanced?: number | null
    lastUpdate?: Date | string
  }

  export type MeasurementMalamCreateOrConnectWithoutSubstationInput = {
    where: MeasurementMalamWhereUniqueInput
    create: XOR<MeasurementMalamCreateWithoutSubstationInput, MeasurementMalamUncheckedCreateWithoutSubstationInput>
  }

  export type MeasurementMalamCreateManySubstationInputEnvelope = {
    data: MeasurementMalamCreateManySubstationInput | MeasurementMalamCreateManySubstationInput[]
    skipDuplicates?: boolean
  }

  export type MeasurementSiangUpsertWithWhereUniqueWithoutSubstationInput = {
    where: MeasurementSiangWhereUniqueInput
    update: XOR<MeasurementSiangUpdateWithoutSubstationInput, MeasurementSiangUncheckedUpdateWithoutSubstationInput>
    create: XOR<MeasurementSiangCreateWithoutSubstationInput, MeasurementSiangUncheckedCreateWithoutSubstationInput>
  }

  export type MeasurementSiangUpdateWithWhereUniqueWithoutSubstationInput = {
    where: MeasurementSiangWhereUniqueInput
    data: XOR<MeasurementSiangUpdateWithoutSubstationInput, MeasurementSiangUncheckedUpdateWithoutSubstationInput>
  }

  export type MeasurementSiangUpdateManyWithWhereWithoutSubstationInput = {
    where: MeasurementSiangScalarWhereInput
    data: XOR<MeasurementSiangUpdateManyMutationInput, MeasurementSiangUncheckedUpdateManyWithoutSubstationInput>
  }

  export type MeasurementSiangScalarWhereInput = {
    AND?: MeasurementSiangScalarWhereInput | MeasurementSiangScalarWhereInput[]
    OR?: MeasurementSiangScalarWhereInput[]
    NOT?: MeasurementSiangScalarWhereInput | MeasurementSiangScalarWhereInput[]
    id?: IntFilter<"MeasurementSiang"> | number
    substationId?: StringFilter<"MeasurementSiang"> | string
    month?: StringFilter<"MeasurementSiang"> | string
    r?: FloatFilter<"MeasurementSiang"> | number
    s?: FloatFilter<"MeasurementSiang"> | number
    t?: FloatFilter<"MeasurementSiang"> | number
    n?: FloatFilter<"MeasurementSiang"> | number
    rn?: FloatFilter<"MeasurementSiang"> | number
    sn?: FloatFilter<"MeasurementSiang"> | number
    tn?: FloatFilter<"MeasurementSiang"> | number
    pp?: FloatFilter<"MeasurementSiang"> | number
    pn?: FloatFilter<"MeasurementSiang"> | number
    row_name?: StringFilter<"MeasurementSiang"> | string
    rata2?: FloatNullableFilter<"MeasurementSiang"> | number | null
    kva?: FloatNullableFilter<"MeasurementSiang"> | number | null
    persen?: FloatNullableFilter<"MeasurementSiang"> | number | null
    unbalanced?: FloatNullableFilter<"MeasurementSiang"> | number | null
    lastUpdate?: DateTimeFilter<"MeasurementSiang"> | Date | string
  }

  export type MeasurementMalamUpsertWithWhereUniqueWithoutSubstationInput = {
    where: MeasurementMalamWhereUniqueInput
    update: XOR<MeasurementMalamUpdateWithoutSubstationInput, MeasurementMalamUncheckedUpdateWithoutSubstationInput>
    create: XOR<MeasurementMalamCreateWithoutSubstationInput, MeasurementMalamUncheckedCreateWithoutSubstationInput>
  }

  export type MeasurementMalamUpdateWithWhereUniqueWithoutSubstationInput = {
    where: MeasurementMalamWhereUniqueInput
    data: XOR<MeasurementMalamUpdateWithoutSubstationInput, MeasurementMalamUncheckedUpdateWithoutSubstationInput>
  }

  export type MeasurementMalamUpdateManyWithWhereWithoutSubstationInput = {
    where: MeasurementMalamScalarWhereInput
    data: XOR<MeasurementMalamUpdateManyMutationInput, MeasurementMalamUncheckedUpdateManyWithoutSubstationInput>
  }

  export type MeasurementMalamScalarWhereInput = {
    AND?: MeasurementMalamScalarWhereInput | MeasurementMalamScalarWhereInput[]
    OR?: MeasurementMalamScalarWhereInput[]
    NOT?: MeasurementMalamScalarWhereInput | MeasurementMalamScalarWhereInput[]
    id?: IntFilter<"MeasurementMalam"> | number
    substationId?: StringFilter<"MeasurementMalam"> | string
    month?: StringFilter<"MeasurementMalam"> | string
    r?: FloatFilter<"MeasurementMalam"> | number
    s?: FloatFilter<"MeasurementMalam"> | number
    t?: FloatFilter<"MeasurementMalam"> | number
    n?: FloatFilter<"MeasurementMalam"> | number
    rn?: FloatFilter<"MeasurementMalam"> | number
    sn?: FloatFilter<"MeasurementMalam"> | number
    tn?: FloatFilter<"MeasurementMalam"> | number
    pp?: FloatFilter<"MeasurementMalam"> | number
    pn?: FloatFilter<"MeasurementMalam"> | number
    row_name?: StringFilter<"MeasurementMalam"> | string
    rata2?: FloatNullableFilter<"MeasurementMalam"> | number | null
    kva?: FloatNullableFilter<"MeasurementMalam"> | number | null
    persen?: FloatNullableFilter<"MeasurementMalam"> | number | null
    unbalanced?: FloatNullableFilter<"MeasurementMalam"> | number | null
    lastUpdate?: DateTimeFilter<"MeasurementMalam"> | Date | string
  }

  export type SubstationCreateWithoutMeasurements_siangInput = {
    id?: string
    no: number
    ulp: string
    noGardu: string
    namaLokasiGardu: string
    jenis: string
    merek: string
    daya: string
    tahun: string
    phasa: string
    tap_trafo_max_tap: string
    penyulang: string
    arahSequence: string
    tanggal: Date | string
    status?: string
    lastUpdate?: Date | string
    is_active?: number
    ugb?: number
    latitude?: number | null
    longitude?: number | null
    measurements_malam?: MeasurementMalamCreateNestedManyWithoutSubstationInput
  }

  export type SubstationUncheckedCreateWithoutMeasurements_siangInput = {
    id?: string
    no: number
    ulp: string
    noGardu: string
    namaLokasiGardu: string
    jenis: string
    merek: string
    daya: string
    tahun: string
    phasa: string
    tap_trafo_max_tap: string
    penyulang: string
    arahSequence: string
    tanggal: Date | string
    status?: string
    lastUpdate?: Date | string
    is_active?: number
    ugb?: number
    latitude?: number | null
    longitude?: number | null
    measurements_malam?: MeasurementMalamUncheckedCreateNestedManyWithoutSubstationInput
  }

  export type SubstationCreateOrConnectWithoutMeasurements_siangInput = {
    where: SubstationWhereUniqueInput
    create: XOR<SubstationCreateWithoutMeasurements_siangInput, SubstationUncheckedCreateWithoutMeasurements_siangInput>
  }

  export type SubstationUpsertWithoutMeasurements_siangInput = {
    update: XOR<SubstationUpdateWithoutMeasurements_siangInput, SubstationUncheckedUpdateWithoutMeasurements_siangInput>
    create: XOR<SubstationCreateWithoutMeasurements_siangInput, SubstationUncheckedCreateWithoutMeasurements_siangInput>
    where?: SubstationWhereInput
  }

  export type SubstationUpdateToOneWithWhereWithoutMeasurements_siangInput = {
    where?: SubstationWhereInput
    data: XOR<SubstationUpdateWithoutMeasurements_siangInput, SubstationUncheckedUpdateWithoutMeasurements_siangInput>
  }

  export type SubstationUpdateWithoutMeasurements_siangInput = {
    id?: StringFieldUpdateOperationsInput | string
    no?: IntFieldUpdateOperationsInput | number
    ulp?: StringFieldUpdateOperationsInput | string
    noGardu?: StringFieldUpdateOperationsInput | string
    namaLokasiGardu?: StringFieldUpdateOperationsInput | string
    jenis?: StringFieldUpdateOperationsInput | string
    merek?: StringFieldUpdateOperationsInput | string
    daya?: StringFieldUpdateOperationsInput | string
    tahun?: StringFieldUpdateOperationsInput | string
    phasa?: StringFieldUpdateOperationsInput | string
    tap_trafo_max_tap?: StringFieldUpdateOperationsInput | string
    penyulang?: StringFieldUpdateOperationsInput | string
    arahSequence?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: IntFieldUpdateOperationsInput | number
    ugb?: IntFieldUpdateOperationsInput | number
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    measurements_malam?: MeasurementMalamUpdateManyWithoutSubstationNestedInput
  }

  export type SubstationUncheckedUpdateWithoutMeasurements_siangInput = {
    id?: StringFieldUpdateOperationsInput | string
    no?: IntFieldUpdateOperationsInput | number
    ulp?: StringFieldUpdateOperationsInput | string
    noGardu?: StringFieldUpdateOperationsInput | string
    namaLokasiGardu?: StringFieldUpdateOperationsInput | string
    jenis?: StringFieldUpdateOperationsInput | string
    merek?: StringFieldUpdateOperationsInput | string
    daya?: StringFieldUpdateOperationsInput | string
    tahun?: StringFieldUpdateOperationsInput | string
    phasa?: StringFieldUpdateOperationsInput | string
    tap_trafo_max_tap?: StringFieldUpdateOperationsInput | string
    penyulang?: StringFieldUpdateOperationsInput | string
    arahSequence?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: IntFieldUpdateOperationsInput | number
    ugb?: IntFieldUpdateOperationsInput | number
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    measurements_malam?: MeasurementMalamUncheckedUpdateManyWithoutSubstationNestedInput
  }

  export type SubstationCreateWithoutMeasurements_malamInput = {
    id?: string
    no: number
    ulp: string
    noGardu: string
    namaLokasiGardu: string
    jenis: string
    merek: string
    daya: string
    tahun: string
    phasa: string
    tap_trafo_max_tap: string
    penyulang: string
    arahSequence: string
    tanggal: Date | string
    status?: string
    lastUpdate?: Date | string
    is_active?: number
    ugb?: number
    latitude?: number | null
    longitude?: number | null
    measurements_siang?: MeasurementSiangCreateNestedManyWithoutSubstationInput
  }

  export type SubstationUncheckedCreateWithoutMeasurements_malamInput = {
    id?: string
    no: number
    ulp: string
    noGardu: string
    namaLokasiGardu: string
    jenis: string
    merek: string
    daya: string
    tahun: string
    phasa: string
    tap_trafo_max_tap: string
    penyulang: string
    arahSequence: string
    tanggal: Date | string
    status?: string
    lastUpdate?: Date | string
    is_active?: number
    ugb?: number
    latitude?: number | null
    longitude?: number | null
    measurements_siang?: MeasurementSiangUncheckedCreateNestedManyWithoutSubstationInput
  }

  export type SubstationCreateOrConnectWithoutMeasurements_malamInput = {
    where: SubstationWhereUniqueInput
    create: XOR<SubstationCreateWithoutMeasurements_malamInput, SubstationUncheckedCreateWithoutMeasurements_malamInput>
  }

  export type SubstationUpsertWithoutMeasurements_malamInput = {
    update: XOR<SubstationUpdateWithoutMeasurements_malamInput, SubstationUncheckedUpdateWithoutMeasurements_malamInput>
    create: XOR<SubstationCreateWithoutMeasurements_malamInput, SubstationUncheckedCreateWithoutMeasurements_malamInput>
    where?: SubstationWhereInput
  }

  export type SubstationUpdateToOneWithWhereWithoutMeasurements_malamInput = {
    where?: SubstationWhereInput
    data: XOR<SubstationUpdateWithoutMeasurements_malamInput, SubstationUncheckedUpdateWithoutMeasurements_malamInput>
  }

  export type SubstationUpdateWithoutMeasurements_malamInput = {
    id?: StringFieldUpdateOperationsInput | string
    no?: IntFieldUpdateOperationsInput | number
    ulp?: StringFieldUpdateOperationsInput | string
    noGardu?: StringFieldUpdateOperationsInput | string
    namaLokasiGardu?: StringFieldUpdateOperationsInput | string
    jenis?: StringFieldUpdateOperationsInput | string
    merek?: StringFieldUpdateOperationsInput | string
    daya?: StringFieldUpdateOperationsInput | string
    tahun?: StringFieldUpdateOperationsInput | string
    phasa?: StringFieldUpdateOperationsInput | string
    tap_trafo_max_tap?: StringFieldUpdateOperationsInput | string
    penyulang?: StringFieldUpdateOperationsInput | string
    arahSequence?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: IntFieldUpdateOperationsInput | number
    ugb?: IntFieldUpdateOperationsInput | number
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    measurements_siang?: MeasurementSiangUpdateManyWithoutSubstationNestedInput
  }

  export type SubstationUncheckedUpdateWithoutMeasurements_malamInput = {
    id?: StringFieldUpdateOperationsInput | string
    no?: IntFieldUpdateOperationsInput | number
    ulp?: StringFieldUpdateOperationsInput | string
    noGardu?: StringFieldUpdateOperationsInput | string
    namaLokasiGardu?: StringFieldUpdateOperationsInput | string
    jenis?: StringFieldUpdateOperationsInput | string
    merek?: StringFieldUpdateOperationsInput | string
    daya?: StringFieldUpdateOperationsInput | string
    tahun?: StringFieldUpdateOperationsInput | string
    phasa?: StringFieldUpdateOperationsInput | string
    tap_trafo_max_tap?: StringFieldUpdateOperationsInput | string
    penyulang?: StringFieldUpdateOperationsInput | string
    arahSequence?: StringFieldUpdateOperationsInput | string
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
    is_active?: IntFieldUpdateOperationsInput | number
    ugb?: IntFieldUpdateOperationsInput | number
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    measurements_siang?: MeasurementSiangUncheckedUpdateManyWithoutSubstationNestedInput
  }

  export type MeasurementSiangCreateManySubstationInput = {
    id?: number
    month: string
    r?: number
    s?: number
    t?: number
    n?: number
    rn?: number
    sn?: number
    tn?: number
    pp?: number
    pn?: number
    row_name: string
    rata2?: number | null
    kva?: number | null
    persen?: number | null
    unbalanced?: number | null
    lastUpdate?: Date | string
  }

  export type MeasurementMalamCreateManySubstationInput = {
    id?: number
    month: string
    r?: number
    s?: number
    t?: number
    n?: number
    rn?: number
    sn?: number
    tn?: number
    pp?: number
    pn?: number
    row_name: string
    rata2?: number | null
    kva?: number | null
    persen?: number | null
    unbalanced?: number | null
    lastUpdate?: Date | string
  }

  export type MeasurementSiangUpdateWithoutSubstationInput = {
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MeasurementSiangUncheckedUpdateWithoutSubstationInput = {
    id?: IntFieldUpdateOperationsInput | number
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MeasurementSiangUncheckedUpdateManyWithoutSubstationInput = {
    id?: IntFieldUpdateOperationsInput | number
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MeasurementMalamUpdateWithoutSubstationInput = {
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MeasurementMalamUncheckedUpdateWithoutSubstationInput = {
    id?: IntFieldUpdateOperationsInput | number
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MeasurementMalamUncheckedUpdateManyWithoutSubstationInput = {
    id?: IntFieldUpdateOperationsInput | number
    month?: StringFieldUpdateOperationsInput | string
    r?: FloatFieldUpdateOperationsInput | number
    s?: FloatFieldUpdateOperationsInput | number
    t?: FloatFieldUpdateOperationsInput | number
    n?: FloatFieldUpdateOperationsInput | number
    rn?: FloatFieldUpdateOperationsInput | number
    sn?: FloatFieldUpdateOperationsInput | number
    tn?: FloatFieldUpdateOperationsInput | number
    pp?: FloatFieldUpdateOperationsInput | number
    pn?: FloatFieldUpdateOperationsInput | number
    row_name?: StringFieldUpdateOperationsInput | string
    rata2?: NullableFloatFieldUpdateOperationsInput | number | null
    kva?: NullableFloatFieldUpdateOperationsInput | number | null
    persen?: NullableFloatFieldUpdateOperationsInput | number | null
    unbalanced?: NullableFloatFieldUpdateOperationsInput | number | null
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}