declare module "lodash" {
  const lodash: {
    merge<TObject, TSource>(object: TObject, source: TSource): TObject & TSource;
    merge<TObject, TSourceOne, TSourceTwo>(
      object: TObject,
      sourceOne: TSourceOne,
      sourceTwo: TSourceTwo,
    ): TObject & TSourceOne & TSourceTwo;
  };

  export default lodash;
}