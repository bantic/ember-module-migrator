var assert = require('power-assert');
var Migrator = require('../../lib');

describe('file-info model', function() {
  describe('destRelativePath', function() {
    var engine;

    beforeEach(function() {
      engine = new Migrator({
        projectRoot: '.'
      });

    });

    it('can calculate a destRelativePath where type is the same as collection', function() {
      var file = engine.fileInfoFor('app/routes/foo-bar.js');

      assert(file.destRelativePath === 'src/ui/routes/foo-bar.js');
    });

    it('can calculate a destRelativePath where type is not the same as collection', function() {
      var file = engine.fileInfoFor('app/adapters/foo.js');

      assert(file.destRelativePath === 'src/data/models/foo/adapter.js');
    });

    it('uses <name>.<ext> instead of <name>/<type>.<ext> when only a single item that is the default type is present', function() {
      var file = engine.fileInfoFor('app/models/foo.js');

      assert(file.destRelativePath === 'src/data/models/foo.js');
    });

    it('uses <name>/<ext> instead of <name>.<type>.<ext> when multiple items exist for the bucket', function() {
      var model = engine.fileInfoFor('app/models/foo.js');
      var adapter = engine.fileInfoFor('app/adapters/foo.js');

      assert(model.destRelativePath === 'src/data/models/foo/model.js');
      assert(adapter.destRelativePath === 'src/data/models/foo/adapter.js');
    });

    it('uses <name>/<ext> instead of <name>.<type>.<ext> when a model and a test exist', function() {
      var model = engine.fileInfoFor('app/models/foo.js');
      var test = engine.fileInfoFor('tests/integration/models/foo-test.js');

      assert(model.destRelativePath === 'src/data/models/foo/model.js');
      assert(test.destRelativePath === 'src/data/models/foo/model-integration-test.js');
    });

    it('uses <name>/<ext> instead of <name>.<type>.<ext> when a mixin and a test exist', function() {
      var model = engine.fileInfoFor('app/mixins/foo.js');
      var test = engine.fileInfoFor('tests/unit/mixins/foo-test.js');

      assert(model.destRelativePath === 'src/utils/mixins/foo/mixin.js');
      assert(test.destRelativePath === 'src/utils/mixins/foo/mixin-unit-test.js');
    });

    it('uses <name>/<ext> instead of <name>.<ext> when a service and a test exist', function() {
      var model = engine.fileInfoFor('app/services/foo.js');
      var test = engine.fileInfoFor('tests/integration/services/foo-test.js');

      assert(model.destRelativePath === 'src/services/foo/service.js');
      assert(test.destRelativePath === 'src/services/foo/service-integration-test.js');
    });

    it('uses <name>/<ext> instead of <name>.<ext> when a util and a test exist', function() {
      var util = engine.fileInfoFor('app/utils/foo.js');
      var test = engine.fileInfoFor('tests/unit/utils/foo-test.js');

      assert(util.destRelativePath === 'src/utils/foo/util.js');
      assert(test.destRelativePath === 'src/utils/foo/util-unit-test.js');
    });

    describe('private components nesting', function() {
      it('detecting private / single use components (template only)', function() {
        var routeTemplate = engine.fileInfoFor('app/templates/posts/index.hbs');
        var componentTemplate = engine.fileInfoFor('app/templates/components/foo-bar.hbs');

        routeTemplate.registerRenderableUsage('foo-bar');

        assert(componentTemplate.destRelativePath === 'src/ui/routes/posts/index/-elements/foo-bar/template.hbs');
      });

      it('detecting private / single use components (component only)', function() {
        var routeTemplate = engine.fileInfoFor('app/templates/posts/index.hbs');
        var component = engine.fileInfoFor('app/components/foo-bar.js');

        routeTemplate.registerRenderableUsage('foo-bar');

        assert(component.destRelativePath === 'src/ui/routes/posts/index/-elements/foo-bar/component.js');
      });

      it('detecting private / single use helper', function() {
        var routeTemplate = engine.fileInfoFor('app/templates/posts/index.hbs');
        var helper = engine.fileInfoFor('app/helpers/bar.js');

        routeTemplate.registerRenderableUsage('bar');

        assert(helper.destRelativePath === 'src/ui/routes/posts/index/-elements/bar.js');
      });

      it('detecting private / single use components (component only)', function() {
        var routeTemplate = engine.fileInfoFor('app/templates/posts/index.hbs');
        var component = engine.fileInfoFor('app/components/foo-bar.js');
        var componentTemplate = engine.fileInfoFor('app/templates/components/foo-bar.hbs');

        routeTemplate.registerRenderableUsage('foo-bar');

        assert(component.destRelativePath === 'src/ui/routes/posts/index/-elements/foo-bar/component.js');
        assert(componentTemplate.destRelativePath === 'src/ui/routes/posts/index/-elements/foo-bar/template.hbs');
      });

      it('detecting private / single use components within other private/single use components', function() {
        var routeTemplate = engine.fileInfoFor('app/templates/posts/index.hbs');
        var fooBarComponent = engine.fileInfoFor('app/components/foo-bar.js');
        var fooBarComponentTemplate = engine.fileInfoFor('app/templates/components/foo-bar.hbs');
        var derpHerkComponent = engine.fileInfoFor('app/components/derp-herk.js');
        var derpHerkComponentTemplate = engine.fileInfoFor('app/templates/components/derp-herk.hbs');

        routeTemplate.registerRenderableUsage('foo-bar');
        fooBarComponentTemplate.registerRenderableUsage('derp-herk');

        assert(fooBarComponent.destRelativePath === 'src/ui/routes/posts/index/-elements/foo-bar/component.js');
        assert(fooBarComponentTemplate.destRelativePath === 'src/ui/routes/posts/index/-elements/foo-bar/template.hbs');
        assert(derpHerkComponent.destRelativePath === 'src/ui/routes/posts/index/-elements/foo-bar/derp-herk/component.js');
        assert(derpHerkComponentTemplate.destRelativePath === 'src/ui/routes/posts/index/-elements/foo-bar/derp-herk/template.hbs');
      });
    });
  });
});
