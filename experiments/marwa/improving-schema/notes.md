# Improving schema

Kafka Schemas for `mirjam-dev-tier` on `dev-sandbox`: a flat subject list and a subject detail view.

## List

- Header: breadcrumbs, title **Schemas**, one primary button **Create new schema**.
- Toolbar: search **Search subjects**. Global compatibility level is a link, with the current level as a status chip beside it. The link opens Set global compatibility.
- Table columns: Subject (link), Versions, Latest, Compatibility. Inherited subjects show the word inherited next to the level.
- Each row has one actions menu: Set compatibility level, then Delete subject.
- The list shows the first page only for now. The pager is hidden.

## Subject

- Open a subject from its name. The Schemas breadcrumb returns to the list.
- Title is the subject name. **Add version** is the first button and uses the plus icon. **Compare schemas** is second, uses the branch icon, and is disabled until the subject has at least two versions. The actions menu is last. Compare opens a side-by-side version view.
- The overflow menu holds Set compatibility level and Delete subject.
- Versions show Version, Schema ID, and a Soft deleted status only on versions that are soft deleted.
- Delete version marks that version soft deleted. Delete subject removes it and, from the detail view, returns to the list.

## Not in this prototype

There is no schema registry API here. Type, Created, and a separate show-deleted request are omitted. Compatibility level names and what delete does to stored schemas are assumptions, called out in the experiment summary.
