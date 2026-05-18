import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::todo.todo",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be logged in to create a todo.");
      }

      const newTodo = await strapi.entityService.create("api::todo.todo", {
        data: {
          ...ctx.request.body.data,
          user: user.id,
          publishedAt: new Date(),
        },
      });

      const sanitizedEntity = await this.sanitizeOutput(newTodo, ctx);
      return this.transformResponse(sanitizedEntity);
    },

    async find(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be logged in to view todos.");
      }

      // Bypass strict REST API validation which blocks querying the user relation
      const todos = await strapi.entityService.findMany("api::todo.todo", {
        ...ctx.query,
        filters: {
          ...((ctx.query.filters as object) || {}),
          user: user.id, // Safely filter at the database level
        },
      });

      const sanitizedEntries = await this.sanitizeOutput(todos, ctx);
      return this.transformResponse(sanitizedEntries);
    },

    async update(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be logged in to update a todo.");
      }

      const { id } = ctx.params;
      // In Strapi v5, ctx.params.id is the documentId string. entityService expects numeric ID.
      // We must use the Document Service to find by documentId!
      const todo = await strapi.documents("api::todo.todo").findOne({
        documentId: id,
        populate: ["user"] as any,
      });

      if (!todo) {
        return ctx.notFound("Todo not found.");
      }

      const todoOwner = (todo as any).user;
      if (!todoOwner || todoOwner.id !== user.id) {
        return ctx.forbidden("You do not own this todo.");
      }

      const response = await super.update(ctx);
      return response;
    },

    async delete(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be logged in to delete a todo.");
      }

      const { id } = ctx.params;
      const todo = await strapi.documents("api::todo.todo").findOne({
        documentId: id,
        populate: ["user"] as any,
      });

      if (!todo) {
        return ctx.notFound("Todo not found.");
      }

      const todoOwner = (todo as any).user;
      if (!todoOwner || todoOwner.id !== user.id) {
        return ctx.forbidden("You do not own this todo.");
      }

      const response = await super.delete(ctx);
      return response;
    },
  }),
);
