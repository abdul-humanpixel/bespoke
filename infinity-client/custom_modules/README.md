# Integrating custom angular modules with new pexip infinity client (proposal) 

In the new pexip infinity client we are trying to . Besides plugin mechanism we introduced while back we are trying to be able to solve as well more complicated problems that ppl might have in case of branding. With custom modules you are able to integrate powerful angular modules with our existing pexip client bundle. Currently with this solution we are able to create custom pages inside the client or add permament components as well like custom `header` for example.

Let's start with creating new angular module from Angular CLI

**First if you dont have angular CLI run (this require Node.js)**

`npm install -g @angular/cli`

**Now you can create new angular project**

`ng new my-custom-module --create-application=false`

Im using `--create-application=false` here to create an empty skeleton, if you want to test locally your module you can remove that flag.

**After successuly creating the skeleton we can create our module/library**

```
cd my-custom-module
ng generate library my-custom-module --prefix=mymodule
```

(you can use this flags as well if you want to have components in separated files and use scss instead of css)

Of course `my-custom-module` and prefix `mymodule` you can change to the name you want. 

If you are familiar with Angular 2+ then you can see you module files are located in `projects/my-custom-module/src/lib` inside the module you can create many component which are either child component or the ones that you will be able to import inside pexip infinity client. 

Let's open `my-custom-module.component.ts` and change a text in the template from `my-custom-module works!` to `my first custom component in the pexip client!`

To be able for pexip client to understand which components are exported and where you should put them we need to edit `my-custom-module.module.ts` we need to add entry to the NgModule decorator called `providers`.

```ts
import { NgModule } from '@angular/core';
import { MyCustomModuleComponent } from './my-custom-module.component';

@NgModule({
  declarations: [MyCustomModuleComponent],
  entryComponents: [MyCustomModuleComponent],
  imports: [
  ],
  providers: [{
    provide: 'plugins',
    useValue: [{
      name: 'mymodule-my-custom-module',
      component: MyCustomModuleComponent
      type: 'page',
      path: 'welcome',
    }],
    multi: true
  }],
  exports: [MyCustomModuleComponent]
})
export class MyCustomModuleModule { }
```

So lets eplain each part first. Components we want to use in pexip clients need to be included in `declarations`, `entryComponents` and `exports`, after that we need to include `providers` as I mentioned before, we will only change the `useValue` array, rest should be always the same.

Each element of `useValue` array contains an object with
* `name` - the `selector` of the component we can find in `my-custom-module.component.ts`.
* `component` just imported component (you can see `import` above)
* `type` [page|header] - represents how the component will be included in the pexip clients its either `page` which will be rendered as a separate page eg `webapp2/my-custom-welcome-page` (this needs `path` arg) or `header` (the name might change) this is component that is bascially loaded in the main component in the app so its can be used as some additional header, sticker, toolbox, toolbar, footer etc.
*`path` - if you use `type: page` you need to provide as well path in our case `welcome` will resolve to `webapp2/welcome` so after navigating to that url we should hopefully see our `MyCustomModuleComponent`.

*if you use `imports` in the module.ts right now we are supporting this modules `CommonModule, FormsModule, HttpClientModule` and you can as well use rxjs inside components*

**After updating component(s) and updating module file we can export our custom file**

To do that we need to run `npm run build` which are making the prod builds of our module they are located in the `dist` folder. We only need the `*.umd.js` file which in our case should be located in `dist/my-custom-module/bundles/my-custom-module.min.js`

**Thats it for the module part, now we need to link the module in our custom manifest.json**

Custom branding skeleton for the new pexip client you can download it from branding portal or created by themself. ( https://docs.pexip.com/admin/customize_clients.htm#create_package )
In our case we only need one file + folder containing our module so I'll create it from scratch

* First lets create **manifest.json** with custom `id` number (which can be generated) and include our custom module

```json
{
    "customModules": [
        {
            "name": "MyCustomModuleModule",
            "srcURL": "custom_configuration/modules/my-custom-module.min.js"
        }
    ]
}

```

now lets create modules folder and copy there umd build from now lets copy `dist/my-custom-module/bundles/my-custom-module.min.js`
all the files should be included in the `webapp2` folder and packed as zip file, so mgmt node can be able to recognize the files when uploading the zip.

so our archide should look smth like this:
```
/webapp2
  manifest.json
  /modules
    my-custom-module.min.js
```

After uploading our branding and navigating to the `/webapp2/welcome` we should be able to see our component and hopefully the `my first custom component in the pexip client!` text in the browser.

Currently communication with the webapp is done through PluginAPI ( https://docs.pexip.com/end_user/guide_for_admins/plugins.htm?Highlight=pluginAPI ) so for instance if we want to show the invitation to the meeting card we just need to call `window.PEX.pluginAPI.navigateToInvitationCard(conferenceName: string, pin?: number)` like said in TODO we should expose the entire router there.

*TODO*

Include useful services inside custom modules like storage for example or router.

